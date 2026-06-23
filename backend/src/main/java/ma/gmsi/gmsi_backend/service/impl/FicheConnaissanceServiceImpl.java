// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/impl/FicheConnaissanceServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.FicheConnaissanceRequest;
import ma.gmsi.gmsi_backend.dto.response.FicheConnaissanceResponse;
import ma.gmsi.gmsi_backend.entity.*;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.*;
import ma.gmsi.gmsi_backend.service.FicheConnaissanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FicheConnaissanceServiceImpl implements FicheConnaissanceService {

    private final FicheConnaissanceRepository ficheRepo;
    private final RapportTechniqueRepository  rapportRepo;
    private final CategorieRepository         categorieRepo;

    private static final Set<String> MOTS_VIDES = Set.of(
            "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou",
            "en", "au", "aux", "par", "sur", "sous", "avec", "pour", "dans",
            "est", "sont", "être", "avoir", "que", "qui", "quoi", "car"
    );

    // ── creerDepuisRapport ───────────────────────────────────────────────────

    @Override
    @Auditable(action = "CREATION_FICHE_CONNAISSANCE", entiteType = "FICHE_CONNAISSANCE")
    public FicheConnaissanceResponse creerDepuisRapport(UUID rapportId) {

        // Idempotence
        Optional<FicheConnaissance> existante = ficheRepo.findByRapportSourceId(rapportId);
        if (existante.isPresent()) {
            return toResponse(existante.get());
        }

        RapportTechnique rapport = rapportRepo.findById(rapportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RapportTechnique non trouvé : " + rapportId));

        Equipement equipement    = null;
        Categorie  categorie     = null;
        String     nomEquipement = "Équipement non précisé";

        Intervention intervention = rapport.getIntervention();
        if (intervention != null && intervention.getDemande() != null) {
            DemandeIntervention demande = intervention.getDemande();
            equipement = demande.getEquipement();
            if (equipement != null) {
                nomEquipement = equipement.getNom();
            }
            categorie = demande.getCategorie();
        }

        String solution  = rapport.getCausePanne();
        String typePanne = (categorie != null)
                ? "Panne — " + categorie.getLibelle()
                : "Panne non catégorisée";

        FicheConnaissance fiche = FicheConnaissance.builder()
                .solution(solution)
                .typePanne(typePanne)
                .equipementCible(nomEquipement)
                .categorie(categorie)
                .rapportSource(rapport)                          // ← nom correct
                .motsCles(extraireMotsCles(solution + " " + typePanne))
                .build();

        return toResponse(ficheRepo.save(fiche));
    }

    // ── creerManuelle ────────────────────────────────────────────────────────

    @Override
    @Auditable(action = "CREATION_FICHE_MANUELLE", entiteType = "FICHE_CONNAISSANCE")
    public FicheConnaissanceResponse creerManuelle(FicheConnaissanceRequest request) {

        Categorie categorie = null;
        if (request.getCategorieId() != null) {
            categorie = categorieRepo.findById(request.getCategorieId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Catégorie non trouvée : " + request.getCategorieId()));
        }

        List<String> motsCles = (request.getMotsCles() != null && !request.getMotsCles().isEmpty())
                ? request.getMotsCles()
                : extraireMotsCles(request.getSolution() + " " + request.getTypePanne());

        FicheConnaissance fiche = FicheConnaissance.builder()
                .typePanne(request.getTypePanne())
                .solution(request.getSolution())
                .equipementCible(request.getEquipementCible())
                .categorie(categorie)
                .motsCles(motsCles)
                .build();                                        // rapportSource nullable ici

        return toResponse(ficheRepo.save(fiche));
    }

    // ── Lecture ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<FicheConnaissanceResponse> rechercher(UUID categorieId, String motCle) {
        String mc = (motCle == null || motCle.isBlank()) ? null : motCle.trim();
        return ficheRepo.rechercherAvecFiltres(categorieId, mc)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FicheConnaissanceResponse getById(UUID id) {
        return ficheRepo.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "FicheConnaissance non trouvée : " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FicheConnaissanceResponse> listerToutes() {
        return ficheRepo.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    // ── Suppression ──────────────────────────────────────────────────────────

    @Override
    @Auditable(action = "SUPPRESSION_FICHE_CONNAISSANCE", entiteType = "FICHE_CONNAISSANCE")
    public void supprimer(UUID id) {
        if (!ficheRepo.existsById(id)) {
            throw new ResourceNotFoundException("FicheConnaissance non trouvée : " + id);
        }
        ficheRepo.deleteById(id);
    }

    // ── Utilitaires ──────────────────────────────────────────────────────────

    private List<String> extraireMotsCles(String texte) {
        if (texte == null || texte.isBlank()) return Collections.emptyList();
        return Arrays.stream(
                        texte.toLowerCase()
                                .replaceAll("[^a-zàâäéèêëîïôùûüç ]", " ")
                                .split("\\s+"))
                .filter(mot -> mot.length() > 4 && !MOTS_VIDES.contains(mot))
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    private FicheConnaissanceResponse toResponse(FicheConnaissance f) {
        return FicheConnaissanceResponse.builder()
                .id(f.getId())
                .dateCreation(f.getDateCreation())
                .equipementCible(f.getEquipementCible())
                .solution(f.getSolution())
                .typePanne(f.getTypePanne())
                .motsCles(f.getMotsCles() != null ? f.getMotsCles() : Collections.emptyList())
                .libelleCategorie(f.getCategorie() != null
                        ? f.getCategorie().getLibelle() : null)
                .refRapportSource(f.getRapportSource() != null              // ← nom correct
                        ? "RPT-" + f.getRapportSource().getId()
                        .toString().substring(0, 8).toUpperCase()
                        : null)
                .build();
    }
}