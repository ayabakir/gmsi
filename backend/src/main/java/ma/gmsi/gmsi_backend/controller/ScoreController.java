package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.EvaluationResponse;
import ma.gmsi.gmsi_backend.dto.response.ScoreResponse;
import ma.gmsi.gmsi_backend.service.ScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE') or hasRole('ADMIN')")
public class ScoreController {

    private final ScoringService scoringService;

    // Score d'un technicien
    @GetMapping("/technicien/{technicienId}")
    public ResponseEntity<ScoreResponse> getScore(@PathVariable UUID technicienId) {
        return ResponseEntity.ok(scoringService.getScoreTechnicien(technicienId));
    }

    // Évaluations reçues par un technicien
    @GetMapping("/technicien/{technicienId}/evaluations")
    public ResponseEntity<List<EvaluationResponse>> getEvaluations(@PathVariable UUID technicienId) {
        return ResponseEntity.ok(scoringService.getEvaluationsTechnicien(technicienId));
    }
}