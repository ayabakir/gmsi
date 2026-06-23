package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.CreateRapportRequest;
import ma.gmsi.gmsi_backend.dto.request.PieceUtiliseeRequest;
import ma.gmsi.gmsi_backend.dto.response.RapportResponse;
import ma.gmsi.gmsi_backend.entity.*;
import ma.gmsi.gmsi_backend.entity.enums.StatutIntervention;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.*;
import ma.gmsi.gmsi_backend.service.MouvementStockService;
import ma.gmsi.gmsi_backend.service.NotificationService;
import ma.gmsi.gmsi_backend.service.RapportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RapportServiceImpl implements RapportService {

    private final RapportTechniqueRepository rapportRepository;
    private final PieceUtiliseeRepository pieceUtiliseeRepository;
    private final InterventionRepository interventionRepository;
    private final AssignationTechnicienRepository assignationRepository;
    private final PieceRechangeRepository pieceRechangeRepository;
    private final MouvementStockService mouvementStockService; // interface d'Ikram (sortie stock)
    private final NotificationService notificationService;

    // ---------------- Technicien : créer le rapport ----------------

    @Override
    @Auditable(action = "CREATION_RAPPORT", entiteType = "RAPPORT")
    public RapportResponse creer(CreateRapportRequest request, UUID technicienId) {

        Intervention intervention = interventionRepository.findById(request.getInterventionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Intervention introuvable : " + request.getInterventionId()));

        // Règle : le rapport ne se rédige que sur une intervention TERMINEE
        if (intervention.getStatut() != StatutIntervention.TERMINEE) {
            throw new BadRequestException(
                    "Le rapport ne peut être rédigé que sur une intervention TERMINEE (statut : "
                            + intervention.getStatut() + ")");
        }

        // Règle : vérifier que c'est bien le technicien affecté
        AssignationTechnicien assignation = assignationRepository
                .findByInterventionId(intervention.getId())
                .orElseThrow(() -> new BadRequestException("Aucun technicien affecté à cette intervention"));
        if (!assignation.getTechnicien().getId().equals(technicienId)) {
            throw new BadRequestException("Vous n'êtes pas le technicien affecté à cette intervention");
        }

        // Règle : un seul rapport par intervention
        if (rapportRepository.existsByInterventionId(intervention.getId())) {
            throw new BadRequestException("Un rapport existe déjà pour cette intervention");
        }

        // Créer le rapport
        RapportTechnique rapport = RapportTechnique.builder()
                .intervention(intervention)
                .causePanne(request.getCausePanne())
                .observations(request.getObservations())
                .build();
        RapportTechnique saved = rapportRepository.save(rapport);

        // Traiter les pièces utilisées : enregistrer + sortie de stock auto
        if (request.getPiecesUtilisees() != null) {
            for (PieceUtiliseeRequest pu : request.getPiecesUtilisees()) {
                PieceRechange piece = pieceRechangeRepository.findById(pu.getPieceId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Pièce introuvable : " + pu.getPieceId()));

                // Enregistrer la pièce utilisée (liée au rapport)
                PieceUtilisee pieceUtilisee = PieceUtilisee.builder()
                        .rapport(saved)
                        .piece(piece)
                        .quantite(pu.getQuantite())
                        .build();
                pieceUtiliseeRepository.save(pieceUtilisee);

                // SORTIE DE STOCK automatique via l'interface d'Ikram (décrémente le stock)
                mouvementStockService.creerSortie(
                        piece.getId(),
                        pu.getQuantite(),
                        "Utilisée sur intervention " + intervention.getReference(),
                        technicienId,
                        intervention.getId());
            }
        }

        return toResponse(saved);
    }

    // ---------------- Commun : consulter le rapport ----------------

    @Override
    @Transactional(readOnly = true)
    public RapportResponse getByIntervention(UUID interventionId) {
        RapportTechnique rapport = rapportRepository.findByInterventionId(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun rapport pour l'intervention : " + interventionId));
        return toResponse(rapport);
    }

    // ---------------- Employé : valider la clôture ----------------

    @Override
    @Auditable(action = "CLOTURE_INTERVENTION", entiteType = "INTERVENTION")
    public RapportResponse validerCloture(UUID interventionId, String signature, UUID employeId) {

        RapportTechnique rapport = rapportRepository.findByInterventionId(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun rapport pour l'intervention : " + interventionId));

        Intervention intervention = rapport.getIntervention();

        // Règle : seul l'employé qui a fait la demande peut valider la clôture
        if (!intervention.getDemande().getEmploye().getId().equals(employeId)) {
            throw new BadRequestException("Seul l'employé concerné peut valider la clôture");
        }

        // Règle : l'intervention doit être TERMINEE (pas déjà clôturée)
        if (intervention.getStatut() != StatutIntervention.TERMINEE) {
            throw new BadRequestException(
                    "Seule une intervention TERMINEE peut être clôturée (statut : "
                            + intervention.getStatut() + ")");
        }

        // Enregistrer la signature dans le rapport
        rapport.setSignatureEmploye(signature);
        rapportRepository.save(rapport);

        // Passer l'intervention à CLOTUREE
        intervention.setStatut(StatutIntervention.CLOTUREE);
        intervention.setClotureValidee(true);
        intervention.setDateCloture(LocalDateTime.now());
        interventionRepository.save(intervention);

        // Notifier le technicien que l'intervention est clôturée
        AssignationTechnicien assignation = assignationRepository
                .findByInterventionId(intervention.getId())
                .orElse(null);
        if (assignation != null) {
            notificationService.envoyer(
                    assignation.getTechnicien().getId(),
                    "FIN_INTERVENTION",
                    Map.of(
                            "prenomEmploye", assignation.getTechnicien().getPrenom(),
                            "nomEquipement", intervention.getDemande().getEquipement().getNom(),
                            "refIntervention", intervention.getReference()
                    ));
        }

        return toResponse(rapport);
    }

    // ---------------- Helper ----------------

    private RapportResponse toResponse(RapportTechnique r) {
        List<RapportResponse.PieceUtiliseeResponse> pieces = new ArrayList<>();
        for (PieceUtilisee pu : pieceUtiliseeRepository.findByRapportId(r.getId())) {
            pieces.add(RapportResponse.PieceUtiliseeResponse.builder()
                    .pieceId(pu.getPiece().getId())
                    .nomPiece(pu.getPiece().getNom())
                    .quantite(pu.getQuantite())
                    .build());
        }

        return RapportResponse.builder()
                .id(r.getId())
                .interventionId(r.getIntervention().getId())
                .interventionReference(r.getIntervention().getReference())
                .causePanne(r.getCausePanne())
                .observations(r.getObservations())
                .signatureEmploye(r.getSignatureEmploye())
                .dateRapport(r.getDateRapport())
                .piecesUtilisees(pieces)
                .build();
    }
}