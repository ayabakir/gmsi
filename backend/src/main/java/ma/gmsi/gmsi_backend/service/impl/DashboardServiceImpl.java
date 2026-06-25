// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/impl/DashboardServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.*;
import ma.gmsi.gmsi_backend.entity.AuditLog;
import ma.gmsi.gmsi_backend.entity.Intervention;
import ma.gmsi.gmsi_backend.entity.ScoreTechnicien;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.entity.enums.StatutIntervention;
import ma.gmsi.gmsi_backend.repository.*;
import ma.gmsi.gmsi_backend.service.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implémentation du service Dashboard (Module I6).
 *
 * RÈGLES :
 * - Lecture seule sur les repositories du périmètre d'Aya (pas de save/delete)
 * - Toutes les agrégations gèrent le cas "aucune donnée" sans lever d'exception
 * - Pas de @Auditable (consultation pure, rien à tracer)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    // ── Repositories du périmètre d'Aya (lecture seule) ──────────────────────
    private final DemandeInterventionRepository demandeInterventionRepository;
    private final InterventionRepository        interventionRepository;
    private final ScoreTechnicienRepository     scoreTechnicienRepository;
    private final AssignationTechnicienRepository assignationTechnicienRepository;

    // ── Repositories du périmètre Ikram (I1-I5) ──────────────────────────────
    private final PieceRechangeRepository pieceRechangeRepository;
    private final UserRepository          userRepository;
    private final AuditLogRepository      auditLogRepository;
    private final ParametreRepository     parametreRepository;

    // ─────────────────────────────────────────────────────────────────────────
    //  DASHBOARD RESPONSABLE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public DashboardResponsableResponse getDashboardResponsable() {
        return new DashboardResponsableResponse(
                computeDemandesParStatut(),
                computeMttrHeures(),
                computeTauxPannesParCategorie(),
                computeTopTechniciens(),
                computePiecesSousSeuilAlerte(),
                computeChargeTechniciens()
        );
    }

    /**
     * a. Demandes groupées par statut.
     * Utilise findAll() puis stream pour rester portable H2/MySQL
     * et éviter une @Query supplémentaire dans le repo d'Aya.
     */
    private Map<String, Long> computeDemandesParStatut() {
        return demandeInterventionRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        d -> d.getStatut().name(),
                        Collectors.counting()
                ));
        // Retourne {} si aucune demande — pas d'exception
    }

    /**
     * b. MTTR (Mean Time To Resolution) en heures.
     * Calcul en Java sur datePlanifiee → dateCloture des interventions CLOTUREES.
     * Retourne null si aucune intervention clôturée.
     *
     * Note : Intervention n'a pas de statut CLOTUREE dans l'enum — on utilise
     * clotureValidee = true comme proxy (champ booléen confirmé dans Intervention.java).
     * Si Aya ajoute un statut CLOTUREE plus tard, remplacer le filtre par :
     * .filter(i -> i.getStatut() == StatutIntervention.CLOTUREE)
     */
    private Double computeMttrHeures() {
        List<Intervention> cloturees = interventionRepository.findAll()
                .stream()
                .filter(i -> i.isClotureValidee()
                        && i.getDatePlanifiee() != null
                        && i.getDateCloture() != null)
                .toList();

        if (cloturees.isEmpty()) {
            return null;
        }

        double moyenneHeures = cloturees.stream()
                .mapToLong(i -> ChronoUnit.HOURS.between(
                        i.getDatePlanifiee(),
                        i.getDateCloture()))
                .average()
                .orElse(0.0);

        // Arrondi à 2 décimales
        return Math.round(moyenneHeures * 100.0) / 100.0;
    }

    /**
     * c. Taux de pannes par catégorie.
     * Jointure via DemandeIntervention.categorie (relation @ManyToOne confirmée).
     * Les demandes sans catégorie sont regroupées sous "Sans catégorie".
     */
    private Map<String, Long> computeTauxPannesParCategorie() {
        return demandeInterventionRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        d -> d.getCategorie() != null
                                ? d.getCategorie().getLibelle()   // Categorie.libelle (confirmé)
                                : "Sans catégorie",
                        Collectors.counting()
                ));
    }

    /**
     * d. Top 5 techniciens par scorePondere DESC.
     * ScoreTechnicien.technicien est une relation @OneToOne vers Utilisateur.
     * scorePondere est BigDecimal → converti en double pour le DTO.
     */
    private List<TopTechnicienDTO> computeTopTechniciens() {
        return scoreTechnicienRepository.findAll()
                .stream()
                .filter(s -> s.getScorePondere() != null)
                .sorted(Comparator.comparing(ScoreTechnicien::getScorePondere).reversed())
                .limit(5)
                .map(s -> new TopTechnicienDTO(
                        s.getTechnicien().getPrenom() + " " + s.getTechnicien().getNom(),
                        s.getScorePondere().doubleValue(),
                        s.getNbEvaluations()
                ))
                .toList();
    }

    /**
     * e. Pièces sous seuil d'alerte — simple count (Module I2).
     */
    private Long computePiecesSousSeuilAlerte() {
        return (long) pieceRechangeRepository.findPiecesSousSeuilAlerte().size();
    }

    /**
     * f. Charge des techniciens.
     * Pour chaque technicien actif, compte ses interventions EN_COURS et PLANIFIEE
     * via AssignationTechnicien → Intervention.statut.
     */
    private List<ChargeTechnicienDTO> computeChargeTechniciens() {
        List<Utilisateur> techniciens = userRepository.findByRole(Role.TECHNICIEN)
                .stream()
                .filter(Utilisateur::isActif)
                .toList();

        List<ChargeTechnicienDTO> result = new ArrayList<>();

        for (Utilisateur tech : techniciens) {
            // Récupère toutes les assignations du technicien
            List<Intervention> interventions = assignationTechnicienRepository
                    .findByTechnicienId(tech.getId())
                    .stream()
                    .map(a -> a.getIntervention())   // AssignationTechnicien.intervention
                    .toList();

            long enCours = interventions.stream()
                    .filter(i -> i.getStatut() == StatutIntervention.EN_COURS)
                    .count();

            long planifiees = interventions.stream()
                    .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE)
                    .count();

            result.add(new ChargeTechnicienDTO(
                    tech.getPrenom() + " " + tech.getNom(),
                    enCours,
                    planifiees
            ));
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  DASHBOARD ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public DashboardAdminResponse getDashboardAdmin() {
        return new DashboardAdminResponse(
                computeNbUtilisateursParRole(),
                computeNbUtilisateursActifs(),
                computeNbUtilisateursInactifs(),
                computeNbActionsAuditRecentes(),
                computeParametresCoeffs(),
                computeDernieresActionsAudit()
        );
    }

    /**
     * a. Utilisateurs groupés par rôle.
     */
    private Map<String, Long> computeNbUtilisateursParRole() {
        return userRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole().name(),
                        Collectors.counting()
                ));
    }

    /**
     * b. Utilisateurs actifs.
     */
    private Long computeNbUtilisateursActifs() {
        return userRepository.findAll()
                .stream()
                .filter(Utilisateur::isActif)
                .count();
    }

    /**
     * c. Utilisateurs inactifs.
     */
    private Long computeNbUtilisateursInactifs() {
        return userRepository.findAll()
                .stream()
                .filter(u -> !u.isActif())
                .count();
    }

    /**
     * d. Actions d'audit dans les dernières 24h.
     * AuditLog.dateAction est @CreatedDate (LocalDateTime).
     * AuditLogRepository.findByDateActionBetween() est confirmé disponible.
     */
    private Long computeNbActionsAuditRecentes() {
        LocalDateTime depuis = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
        LocalDateTime maintenant = LocalDateTime.now();
        return (long) auditLogRepository
                .findByDateActionBetween(depuis, maintenant)
                .size();
    }

    /**
     * e. Paramètres de scoring — les 4 clés COEFF_*.
     * ParametreRepository.findByCle() est confirmé disponible.
     * Si une clé n'existe pas encore en base, elle est ignorée (pas de 500).
     */
    private Map<String, String> computeParametresCoeffs() {
        List<String> clesCibles = List.of(
                "COEFF_RAPIDITE",
                "COEFF_QUALITE",
                "COEFF_DIFFICULTE",
                "COEFF_SATISFACTION"
        );

        Map<String, String> coeffs = new LinkedHashMap<>();
        for (String cle : clesCibles) {
            parametreRepository.findByCle(cle)
                    .ifPresent(p -> coeffs.put(cle, p.getValeur()));
        }
        return coeffs;
    }

    /**
     * f. 10 dernières actions d'audit, tri dateAction DESC.
     * AuditLog.utilisateur est @ManyToOne (confirmé dans AuditLog.java).
     * emailUtilisateur est résolu depuis la relation JPA directement.
     */
    private List<AuditLogResponse> computeDernieresActionsAudit() {
        return auditLogRepository
                .findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "dateAction")))
                .getContent()
                .stream()
                .map(this::toAuditLogResponse)
                .toList();
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        String email = log.getUtilisateur() != null
                ? log.getUtilisateur().getEmail()
                : "inconnu";
        return new AuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getEntiteType(),
                log.getIdEntite(),
                email,
                log.getDetails(),
                log.getDateAction()
        );
    }
}