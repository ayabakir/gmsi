package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.CreateInterventionRequest;
import ma.gmsi.gmsi_backend.dto.response.InterventionResponse;
import ma.gmsi.gmsi_backend.entity.*;
import ma.gmsi.gmsi_backend.entity.enums.*;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.*;
import ma.gmsi.gmsi_backend.service.InterventionService;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InterventionServiceImpl implements InterventionService {

    private final InterventionRepository interventionRepository;
    private final AssignationTechnicienRepository assignationRepository;
    private final HistoriqueStatutRepository historiqueRepository;
    private final DemandeInterventionRepository demandeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ---------------- Responsable ----------------

    @Override
    @Auditable(action = "CREATION_INTERVENTION", entiteType = "INTERVENTION")
    public InterventionResponse creer(CreateInterventionRequest request, UUID responsableId) {

        DemandeIntervention demande = demandeRepository.findById(request.getDemandeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Demande introuvable : " + request.getDemandeId()));

        // Règle : on ne crée une intervention que depuis une demande validée (ASSIGNEE)
        if (demande.getStatut() != StatutDemande.ASSIGNEE) {
            throw new BadRequestException(
                    "L'intervention ne peut être créée que depuis une demande validée (ASSIGNEE). "
                            + "Statut actuel : " + demande.getStatut());
        }

        // Règle : une demande ne peut avoir qu'une seule intervention
        if (interventionRepository.existsByDemandeId(demande.getId())) {
            throw new BadRequestException("Une intervention existe déjà pour cette demande");
        }

        Utilisateur responsable = userRepository.findById(responsableId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Responsable introuvable : " + responsableId));

        // Vérifier que le technicien existe et a bien le rôle TECHNICIEN
        Utilisateur technicien = userRepository.findById(request.getTechnicienId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Technicien introuvable : " + request.getTechnicienId()));
        if (technicien.getRole() != Role.TECHNICIEN) {
            throw new BadRequestException("L'utilisateur affecté n'est pas un technicien");
        }

        // Créer l'intervention (statut initial PLANIFIEE)
        Intervention intervention = Intervention.builder()
                .reference(genererReference())
                .demande(demande)
                .responsable(responsable)
                .statut(StatutIntervention.PLANIFIEE)
                .niveauPriorite(parsePriorite(request.getNiveauPriorite()))
                .niveauDifficulte(parseDifficulte(request.getNiveauDifficulte()))
                .datePlanifiee(request.getDatePlanifiee())
                .build();
        Intervention saved = interventionRepository.save(intervention);

        // Affecter le technicien
        AssignationTechnicien assignation = AssignationTechnicien.builder()
                .intervention(saved)
                .technicien(technicien)
                .build();
        assignationRepository.save(assignation);

        // Historiser la création (null -> PLANIFIEE)
        enregistrerHistorique(saved, null, StatutIntervention.PLANIFIEE, responsable, "Intervention créée");

        // Notifier le technicien qu'il a une nouvelle mission
        notificationService.envoyer(
                technicien.getId(),
                "MISSION_AFFECTEE",
                Map.of(
                        "prenomTechnicien", technicien.getPrenom(),
                        "refIntervention", saved.getReference(),
                        "nomEquipement", demande.getEquipement().getNom(),
                        "datePlanifiee", formatDate(saved.getDatePlanifiee())
                ));

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> toutes(String statut) {
        List<Intervention> list = (statut == null || statut.isBlank())
                ? interventionRepository.findAllByOrderByReferenceDesc()
                : interventionRepository.findByStatutOrderByReferenceDesc(parseStatut(statut));
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---------------- Commun ----------------

    @Override
    @Transactional(readOnly = true)
    public InterventionResponse getById(UUID id) {
        return toResponse(getInterventionOrThrow(id));
    }

    // ---------------- Technicien ----------------

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> mesInterventions(UUID technicienId) {
        return assignationRepository.findByTechnicienId(technicienId)
                .stream()
                .map(a -> toResponse(a.getIntervention()))
                .collect(Collectors.toList());
    }

    @Override
    @Auditable(action = "DEMARRER_INTERVENTION", entiteType = "INTERVENTION")
    public InterventionResponse demarrer(UUID id, String commentaire, UUID technicienId) {
        Intervention intervention = getInterventionOrThrow(id);
        verifierTechnicienAffecte(intervention, technicienId);

        if (intervention.getStatut() != StatutIntervention.PLANIFIEE) {
            throw new BadRequestException(
                    "Seule une intervention PLANIFIEE peut être démarrée (statut : "
                            + intervention.getStatut() + ")");
        }

        StatutIntervention ancien = intervention.getStatut();
        intervention.setStatut(StatutIntervention.EN_COURS);
        intervention.setDateDebutReelle(LocalDateTime.now());
        Intervention saved = interventionRepository.save(intervention);

        Utilisateur technicien = userRepository.findById(technicienId).orElseThrow();
        enregistrerHistorique(saved, ancien, StatutIntervention.EN_COURS, technicien, commentaire);

        // TODO[A3-NOTIF-RESP]: notifier le responsable du démarrage (template INTERVENTION_DEMARREE à créer par Ikram)

        return toResponse(saved);
    }

    @Override
    @Auditable(action = "TERMINER_INTERVENTION", entiteType = "INTERVENTION")
    public InterventionResponse terminer(UUID id, String commentaire, UUID technicienId) {
        Intervention intervention = getInterventionOrThrow(id);
        verifierTechnicienAffecte(intervention, technicienId);

        if (intervention.getStatut() != StatutIntervention.EN_COURS) {
            throw new BadRequestException(
                    "Seule une intervention EN_COURS peut être terminée (statut : "
                            + intervention.getStatut() + ")");
        }

        StatutIntervention ancien = intervention.getStatut();
        intervention.setStatut(StatutIntervention.TERMINEE);
        intervention.setDateFinReelle(LocalDateTime.now());
        Intervention saved = interventionRepository.save(intervention);

        Utilisateur technicien = userRepository.findById(technicienId).orElseThrow();
        enregistrerHistorique(saved, ancien, StatutIntervention.TERMINEE, technicien, commentaire);

        // Notifier l'employé que sa panne est réparée
        notificationService.envoyer(
                intervention.getDemande().getEmploye().getId(),
                "FIN_INTERVENTION",
                Map.of(
                        "prenomEmploye", intervention.getDemande().getEmploye().getPrenom(),
                        "nomEquipement", intervention.getDemande().getEquipement().getNom(),
                        "refIntervention", saved.getReference()
                ));

        // TODO[A3-NOTIF-RESP]: notifier aussi le responsable (template INTERVENTION_TERMINEE_RESP à créer par Ikram)

        return toResponse(saved);
    }

    // ---------------- Helpers ----------------

    private Intervention getInterventionOrThrow(UUID id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable : " + id));
    }

    // Vérifie que le technicien qui agit est bien celui affecté à l'intervention
    private void verifierTechnicienAffecte(Intervention intervention, UUID technicienId) {
        AssignationTechnicien assignation = assignationRepository
                .findByInterventionId(intervention.getId())
                .orElseThrow(() -> new BadRequestException("Aucun technicien affecté à cette intervention"));
        if (!assignation.getTechnicien().getId().equals(technicienId)) {
            throw new BadRequestException("Vous n'êtes pas le technicien affecté à cette intervention");
        }
    }

    private void enregistrerHistorique(Intervention intervention, StatutIntervention ancien,
                                       StatutIntervention nouveau, Utilisateur user, String commentaire) {
        HistoriqueStatut h = HistoriqueStatut.builder()
                .intervention(intervention)
                .ancienStatut(ancien)
                .nouveauStatut(nouveau)
                .commentaire(commentaire)
                .utilisateur(user)
                .build();
        historiqueRepository.save(h);
    }

    private String genererReference() {
        long n = interventionRepository.count() + 1;
        return String.format("INT-2026-%04d", n);
    }

    // Formate une date pour l'affichage dans les notifications (gère le cas null)
    private String formatDate(LocalDateTime date) {
        if (date == null) return "à planifier";
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    private NiveauPriorite parsePriorite(String v) {
        try { return NiveauPriorite.valueOf(v.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new BadRequestException("Priorité invalide : " + v
                    + " (BASSE, MOYENNE, HAUTE, CRITIQUE)");
        }
    }

    private NiveauDifficulte parseDifficulte(String v) {
        try { return NiveauDifficulte.valueOf(v.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new BadRequestException("Difficulté invalide : " + v
                    + " (FACILE, MOYEN, DIFFICILE, CRITIQUE)");
        }
    }

    private StatutIntervention parseStatut(String v) {
        try { return StatutIntervention.valueOf(v.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new BadRequestException("Statut invalide : " + v);
        }
    }

    private InterventionResponse toResponse(Intervention i) {
        // Récupérer le technicien affecté (s'il existe)
        UUID technicienId = null;
        String technicienNom = null;
        var assignation = assignationRepository.findByInterventionId(i.getId());
        if (assignation.isPresent()) {
            Utilisateur t = assignation.get().getTechnicien();
            technicienId = t.getId();
            technicienNom = t.getNom() + " " + t.getPrenom();
        }

        return InterventionResponse.builder()
                .id(i.getId())
                .reference(i.getReference())
                .statut(i.getStatut().name())
                .niveauPriorite(i.getNiveauPriorite().name())
                .niveauDifficulte(i.getNiveauDifficulte().name())
                .datePlanifiee(i.getDatePlanifiee())
                .dateDebutReelle(i.getDateDebutReelle())
                .dateFinReelle(i.getDateFinReelle())
                .clotureValidee(i.isClotureValidee())
                .dateCloture(i.getDateCloture())
                .demandeId(i.getDemande().getId())
                .demandeReference(i.getDemande().getReference())
                .demandeDescription(i.getDemande().getDescription())
                .responsableId(i.getResponsable().getId())
                .responsableNom(i.getResponsable().getNom() + " " + i.getResponsable().getPrenom())
                .technicienId(technicienId)
                .technicienNom(technicienNom)
                .build();
    }
}