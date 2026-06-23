package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.CreateRapportRequest;
import ma.gmsi.gmsi_backend.dto.response.RapportResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.RapportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/technicien/rapports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TECHNICIEN')")
public class RapportTechnicienController {

    private final RapportService rapportService;

    @PostMapping
    public ResponseEntity<RapportResponse> creer(@Valid @RequestBody CreateRapportRequest request,
                                                 Authentication auth) {
        UUID technicienId = ((UserPrincipal) auth.getPrincipal()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rapportService.creer(request, technicienId));
    }

    // Consulter le rapport d'une intervention
    @GetMapping("/intervention/{interventionId}")
    public ResponseEntity<RapportResponse> getByIntervention(@PathVariable UUID interventionId) {
        return ResponseEntity.ok(rapportService.getByIntervention(interventionId));
    }
}