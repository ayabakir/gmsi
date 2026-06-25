package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.CreateDemandeRequest;
import ma.gmsi.gmsi_backend.dto.response.DemandeResponse;
import ma.gmsi.gmsi_backend.entity.*;
import ma.gmsi.gmsi_backend.entity.enums.NiveauUrgence;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.entity.enums.StatutDemande;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.*;
import ma.gmsi.gmsi_backend.service.DemandeService;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DemandeServiceImpl implements DemandeService {

    private final DemandeInterventionRepository demandeRepository;
    private final UserRepository userRepository;
    private final EquipementRepository equipementRepository;
    private final CategorieRepository categorieRepository;
    private final LocalisationRepository localisationRepository;
    private final NotificationService notificationService;
    private final InterventionRepository interventionRepository;

    // ---------------- Employé ----------------

    @Override
    @Auditable(action = "CREATION_DEMANDE", entiteType = "DEMANDE")
    public DemandeResponse creer(CreateDemandeRequest request, UUID employeId) {
        Utilisateur employe = userRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable : " + employeId));

        Equipement equipement = equipementRepository.findById(request.getEquipementId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Équipement introuvable : " + request.getEquipementId()));

        DemandeIntervention demande = DemandeIntervention.builder()
                .reference(genererReference())
                .description(request.getDescription())
                .statut(StatutDemande.EN_ATTENTE)
                .niveauUrgence(parseUrgence(request.getNiveauUrgence()))
                .employe(employe)
                .equipement(equipement)
                .build();

        // Catégorie optionnelle
        if (request.getCategorieId() != null) {
            Categorie cat = categorieRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Catégorie introuvable : " + request.getCategorieId()));
            demande.setCategorie(cat);
        }

        // Localisation optionnelle
        if (request.getLocalisationId() != null) {
            Localisation loc = localisationRepository.findById(request.getLocalisationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Localisation introuvable : " + request.getLocalisationId()));
            demande.setLocalisation(loc);
        }

        DemandeIntervention saved = demandeRepository.save(demande);

        // Notifier l'employé que sa demande a bien été reçue
        notificationService.envoyer(
                employe.getId(),
                "DEMANDE_RECUE",
                Map.of(
                        "prenomEmploye", employe.getPrenom(),
                        "refDemande", saved.getReference(),
                        "descEquipement", equipement.getNom()
                ));

        // Notifier tous les responsables qu'une nouvelle demande est à traiter
        for (Utilisateur resp : userRepository.findByRole(Role.RESPONSABLE)) {
            notificationService.envoyer(
                    resp.getId(),
                    "DEMANDE_A_TRAITER",
                    Map.of(
                            "refDemande", saved.getReference(),
                            "prenomEmploye", employe.getPrenom(),
                            "descEquipement", equipement.getNom()
                    ));
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeResponse> mesDemandes(UUID employeId) {
        return demandeRepository.findByEmployeIdOrderByDateCreationDesc(employeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---------------- Commun ----------------

    @Override
    @Transactional(readOnly = true)
    public DemandeResponse getById(UUID id) {
        return toResponse(getDemandeOrThrow(id));
    }

    // ---------------- Responsable ----------------

    @Override
    @Transactional(readOnly = true)
    public List<DemandeResponse> toutes(String statut) {
        List<DemandeIntervention> demandes = (statut == null || statut.isBlank())
                ? demandeRepository.findAllByOrderByDateCreationDesc()
                : demandeRepository.findByStatutOrderByDateCreationDesc(parseStatut(statut));
        return demandes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Auditable(action = "VALIDATION_DEMANDE", entiteType = "DEMANDE")
    public DemandeResponse valider(UUID id) {
        DemandeIntervention demande = getDemandeOrThrow(id);

        // Règle : on ne peut valider qu'une demande EN_ATTENTE
        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new BadRequestException(
                    "Seule une demande en attente peut être validée (statut actuel : "
                            + demande.getStatut() + ")");
        }

        demande.setStatut(StatutDemande.ASSIGNEE);
        DemandeIntervention saved = demandeRepository.save(demande);

        // Notifier l'employé que sa demande est validée
        notificationService.envoyer(
                demande.getEmploye().getId(),
                "DEMANDE_ASSIGNEE",
                Map.of(
                        "prenomEmploye", demande.getEmploye().getPrenom(),
                        "refDemande", demande.getReference(),
                        "nomTechnicien", "à assigner",
                        "datePlanifiee", "à planifier"
                ));

        return toResponse(saved);
    }

    @Override
    @Auditable(action = "REJET_DEMANDE", entiteType = "DEMANDE")
    public DemandeResponse rejeter(UUID id, String motif) {
        DemandeIntervention demande = getDemandeOrThrow(id);

        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new BadRequestException(
                    "Seule une demande en attente peut être rejetée (statut actuel : "
                            + demande.getStatut() + ")");
        }

        demande.setStatut(StatutDemande.REJETEE);
        demande.setMotifRejet(motif);
        DemandeIntervention saved = demandeRepository.save(demande);

        // Notifier l'employé que sa demande est rejetée
        notificationService.envoyer(
                demande.getEmploye().getId(),
                "DEMANDE_REJETEE",
                Map.of(
                        "prenomEmploye", demande.getEmploye().getPrenom(),
                        "refDemande", demande.getReference(),
                        "motifRejet", motif
                ));

        return toResponse(saved);
    }

    // ---------------- Helpers ----------------

    private DemandeIntervention getDemandeOrThrow(UUID id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable : " + id));
    }

    private String genererReference() {
        long n = demandeRepository.count() + 1;
        return String.format("DEM-2026-%04d", n);
    }

    private NiveauUrgence parseUrgence(String v) {
        try {
            return NiveauUrgence.valueOf(v.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Niveau d'urgence invalide : " + v
                    + " (BASSE, MOYENNE, HAUTE, CRITIQUE)");
        }
    }

    private StatutDemande parseStatut(String v) {
        try {
            return StatutDemande.valueOf(v.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Statut invalide : " + v);
        }
    }

    private DemandeResponse toResponse(DemandeIntervention d) {
        return DemandeResponse.builder()
                .id(d.getId())
                .reference(d.getReference())
                .description(d.getDescription())
                .statut(d.getStatut().name())
                .niveauUrgence(d.getNiveauUrgence().name())
                .motifRejet(d.getMotifRejet())
                .employeId(d.getEmploye().getId())
                .employeNom(d.getEmploye().getNom() + " " + d.getEmploye().getPrenom())
                .equipementId(d.getEquipement().getId())
                .equipementNom(d.getEquipement().getNom())
                .categorieId(d.getCategorie() != null ? d.getCategorie().getId() : null)
                .categorieLibelle(d.getCategorie() != null ? d.getCategorie().getLibelle() : null)
                .localisationId(d.getLocalisation() != null ? d.getLocalisation().getId() : null)
                .localisationLibelle(d.getLocalisation() != null ? d.getLocalisation().getLibelle() : null)
                .dateCreation(d.getDateCreation())
                .interventionId(
                        interventionRepository.findByDemandeId(d.getId())
                                .map(Intervention::getId)
                                .orElse(null))
                .build();
    }
}