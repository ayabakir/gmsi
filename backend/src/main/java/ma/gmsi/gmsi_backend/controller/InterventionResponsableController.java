package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.CreateInterventionRequest;
import ma.gmsi.gmsi_backend.dto.response.InterventionResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.InterventionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/responsable/interventions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE') or hasRole('ADMIN')")
public class InterventionResponsableController {

    private final InterventionService interventionService;

    @PostMapping
    public ResponseEntity<InterventionResponse> creer(@Valid @RequestBody CreateInterventionRequest request,
                                                      Authentication auth) {
        UUID responsableId = ((UserPrincipal) auth.getPrincipal()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interventionService.creer(request, responsableId));
    }

    @GetMapping
    public ResponseEntity<List<InterventionResponse>> toutes(
            @RequestParam(required = false) String statut) {
        return ResponseEntity.ok(interventionService.toutes(statut));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponse> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.getById(id));
    }
}