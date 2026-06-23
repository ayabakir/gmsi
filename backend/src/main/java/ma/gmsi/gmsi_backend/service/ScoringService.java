package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.CreateEvaluationRequest;
import ma.gmsi.gmsi_backend.dto.response.EvaluationResponse;
import ma.gmsi.gmsi_backend.dto.response.ScoreResponse;

import java.util.List;
import java.util.UUID;

public interface ScoringService {

    // --- Employé : évaluer le technicien après clôture ---
    EvaluationResponse evaluer(CreateEvaluationRequest request, UUID employeId);

    // --- Consultation ---
    ScoreResponse getScoreTechnicien(UUID technicienId);
    List<EvaluationResponse> getEvaluationsTechnicien(UUID technicienId);

    // --- Recalcul ---
    void recalculerScore(UUID technicienId);   // recalcule un technicien
    void recalculerTous();                     // recalcule TOUS (appelé par Ikram via endpoint interne)
}