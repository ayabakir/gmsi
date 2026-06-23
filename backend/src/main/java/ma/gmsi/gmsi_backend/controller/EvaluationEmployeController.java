package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.CreateEvaluationRequest;
import ma.gmsi.gmsi_backend.dto.response.EvaluationResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.ScoringService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/employe/evaluations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYE')")
public class EvaluationEmployeController {

    private final ScoringService scoringService;

    @PostMapping
    public ResponseEntity<EvaluationResponse> evaluer(@Valid @RequestBody CreateEvaluationRequest request,
                                                      Authentication auth) {
        UUID employeId = ((UserPrincipal) auth.getPrincipal()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scoringService.evaluer(request, employeId));
    }
}