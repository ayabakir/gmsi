package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.ChangerStatutRequest;
import ma.gmsi.gmsi_backend.dto.response.InterventionResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.InterventionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/technicien/interventions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TECHNICIEN')")
public class InterventionTechnicienController {

    private final InterventionService interventionService;

    @GetMapping
    public ResponseEntity<List<InterventionResponse>> mesInterventions(Authentication auth) {
        UUID technicienId = ((UserPrincipal) auth.getPrincipal()).getId();
        return ResponseEntity.ok(interventionService.mesInterventions(technicienId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponse> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.getById(id));
    }

    @PutMapping("/{id}/demarrer")
    public ResponseEntity<InterventionResponse> demarrer(@PathVariable UUID id,
                                                         @RequestBody(required = false) ChangerStatutRequest request,
                                                         Authentication auth) {
        UUID technicienId = ((UserPrincipal) auth.getPrincipal()).getId();
        String commentaire = (request != null) ? request.getCommentaire() : null;
        return ResponseEntity.ok(interventionService.demarrer(id, commentaire, technicienId));
    }

    @PutMapping("/{id}/terminer")
    public ResponseEntity<InterventionResponse> terminer(@PathVariable UUID id,
                                                         @RequestBody(required = false) ChangerStatutRequest request,
                                                         Authentication auth) {
        UUID technicienId = ((UserPrincipal) auth.getPrincipal()).getId();
        String commentaire = (request != null) ? request.getCommentaire() : null;
        return ResponseEntity.ok(interventionService.terminer(id, commentaire, technicienId));
    }
}