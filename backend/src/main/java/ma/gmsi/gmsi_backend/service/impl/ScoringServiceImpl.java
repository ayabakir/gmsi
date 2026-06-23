package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.CreateEvaluationRequest;
import ma.gmsi.gmsi_backend.dto.response.EvaluationResponse;
import ma.gmsi.gmsi_backend.dto.response.ScoreResponse;
import ma.gmsi.gmsi_backend.entity.*;
import ma.gmsi.gmsi_backend.entity.enums.NiveauDifficulte;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.entity.enums.StatutIntervention;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.*;
import ma.gmsi.gmsi_backend.service.ScoringService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ScoringServiceImpl implements ScoringService {

    private final EvaluationRepository evaluationRepository;
    private final ScoreTechnicienRepository scoreRepository;
    private final InterventionRepository interventionRepository;
    private final AssignationTechnicienRepository assignationRepository;
    private final UserRepository userRepository;
    private final ParametreRepository parametreRepository;

    // ---------------- Employé : évaluer ----------------

    @Override
    @Auditable(action = "CREATION_EVALUATION", entiteType = "EVALUATION")
    public EvaluationResponse evaluer(CreateEvaluationRequest request, UUID employeId) {

        Intervention intervention = interventionRepository.findById(request.getInterventionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Intervention introuvable : " + request.getInterventionId()));

        // Règle : on n'évalue qu'une intervention CLOTUREE
        if (intervention.getStatut() != StatutIntervention.CLOTUREE) {
            throw new BadRequestException(
                    "Seule une intervention CLOTUREE peut être évaluée (statut : "
                            + intervention.getStatut() + ")");
        }

        // Règle : seul l'employé concerné peut évaluer
        if (!intervention.getDemande().getEmploye().getId().equals(employeId)) {
            throw new BadRequestException("Seul l'employé concerné peut évaluer cette intervention");
        }

        // Règle : une seule évaluation par intervention/employé
        if (evaluationRepository.existsByInterventionIdAndEmployeId(intervention.getId(), employeId)) {
            throw new BadRequestException("Vous avez déjà évalué cette intervention");
        }

        Utilisateur employe = userRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable : " + employeId));

        // Récupérer le technicien affecté
        AssignationTechnicien assignation = assignationRepository
                .findByInterventionId(intervention.getId())
                .orElseThrow(() -> new BadRequestException("Aucun technicien affecté à cette intervention"));
        Utilisateur technicien = assignation.getTechnicien();

        // Le niveau de difficulté vient de l'intervention (automatique)
        Evaluation evaluation = Evaluation.builder()
                .intervention(intervention)
                .employe(employe)
                .technicien(technicien)
                .note(request.getNote())
                .commentaire(request.getCommentaire())
                .niveauDifficulte(intervention.getNiveauDifficulte())
                .build();
        Evaluation saved = evaluationRepository.save(evaluation);

        // Recalculer le score du technicien
        recalculerScore(technicien.getId());

        return toEvaluationResponse(saved);
    }

    // ---------------- Consultation ----------------

    @Override
    @Transactional(readOnly = true)
    public ScoreResponse getScoreTechnicien(UUID technicienId) {
        ScoreTechnicien score = scoreRepository.findByTechnicienId(technicienId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun score pour ce technicien (pas encore d'évaluation)"));
        return toScoreResponse(score);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponse> getEvaluationsTechnicien(UUID technicienId) {
        return evaluationRepository.findByTechnicienIdOrderByDateEvaluationDesc(technicienId)
                .stream().map(this::toEvaluationResponse).collect(Collectors.toList());
    }

    // ---------------- Recalcul ----------------

    @Override
    public void recalculerScore(UUID technicienId) {
        Utilisateur technicien = userRepository.findById(technicienId)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien introuvable : " + technicienId));

        List<Evaluation> evaluations = evaluationRepository.findByTechnicienId(technicienId);

        // Récupérer ou créer le ScoreTechnicien
        ScoreTechnicien score = scoreRepository.findByTechnicienId(technicienId)
                .orElse(ScoreTechnicien.builder().technicien(technicien).build());

        if (evaluations.isEmpty()) {
            score.setScorePondere(BigDecimal.ZERO);
            score.setNoteBruteMoyenne(BigDecimal.ZERO);
            score.setNbEvaluations(0);
            score.setDateCalcul(LocalDateTime.now());
            scoreRepository.save(score);
            return;
        }

        // Score pondéré = Σ(note × coeff) / Σ(coeff)
        BigDecimal sommeNotesPonderees = BigDecimal.ZERO;
        BigDecimal sommeCoefficients = BigDecimal.ZERO;
        int sommeNotesBrutes = 0;

        for (Evaluation e : evaluations) {
            BigDecimal coeff = getCoefficient(e.getNiveauDifficulte());
            sommeNotesPonderees = sommeNotesPonderees.add(
                    BigDecimal.valueOf(e.getNote()).multiply(coeff));
            sommeCoefficients = sommeCoefficients.add(coeff);
            sommeNotesBrutes += e.getNote();
        }

        BigDecimal scorePondere = sommeNotesPonderees.divide(sommeCoefficients, 2, RoundingMode.HALF_UP);
        BigDecimal noteBruteMoyenne = BigDecimal.valueOf(sommeNotesBrutes)
                .divide(BigDecimal.valueOf(evaluations.size()), 2, RoundingMode.HALF_UP);

        score.setScorePondere(scorePondere);
        score.setNoteBruteMoyenne(noteBruteMoyenne);
        score.setNbEvaluations(evaluations.size());
        score.setDateCalcul(LocalDateTime.now());
        scoreRepository.save(score);
    }

    @Override
    public void recalculerTous() {
        // Appelé par Ikram quand un coefficient change
        // On recalcule le score de tous les techniciens
        List<Utilisateur> techniciens = userRepository.findByRole(Role.TECHNICIEN);
        for (Utilisateur t : techniciens) {
            recalculerScore(t.getId());
        }
    }

    // ---------------- Helpers ----------------

    // Lit le coefficient depuis les paramètres système (COEFF_FACILE, etc.)
    private BigDecimal getCoefficient(NiveauDifficulte difficulte) {
        String cle = "COEFF_" + difficulte.name(); // ex: COEFF_FACILE
        Parametre param = parametreRepository.findByCle(cle)
                .orElseThrow(() -> new ResourceNotFoundException("Paramètre introuvable : " + cle));
        return new BigDecimal(param.getValeur());
    }

    private EvaluationResponse toEvaluationResponse(Evaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId())
                .interventionId(e.getIntervention().getId())
                .interventionReference(e.getIntervention().getReference())
                .note(e.getNote())
                .commentaire(e.getCommentaire())
                .niveauDifficulte(e.getNiveauDifficulte().name())
                .technicienId(e.getTechnicien().getId())
                .technicienNom(e.getTechnicien().getNom() + " " + e.getTechnicien().getPrenom())
                .dateEvaluation(e.getDateEvaluation())
                .build();
    }

    private ScoreResponse toScoreResponse(ScoreTechnicien s) {
        return ScoreResponse.builder()
                .technicienId(s.getTechnicien().getId())
                .technicienNom(s.getTechnicien().getNom() + " " + s.getTechnicien().getPrenom())
                .scorePondere(s.getScorePondere())
                .noteBruteMoyenne(s.getNoteBruteMoyenne())
                .nbEvaluations(s.getNbEvaluations())
                .dateCalcul(s.getDateCalcul())
                .build();
    }
}