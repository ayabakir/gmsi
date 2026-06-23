package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.ClotureRequest;
import ma.gmsi.gmsi_backend.dto.response.RapportResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.RapportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/employe/rapports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYE')")
public class RapportEmployeController {

    private final RapportService rapportService;

    // Consulter le rapport d'une intervention (pour le lire avant de valider)
    @GetMapping("/intervention/{interventionId}")
    public ResponseEntity<RapportResponse> getByIntervention(@PathVariable UUID interventionId) {
        return ResponseEntity.ok(rapportService.getByIntervention(interventionId));
    }

    // Valider la clôture (avec signature) → intervention CLOTUREE
    @PutMapping("/intervention/{interventionId}/cloturer")
    public ResponseEntity<RapportResponse> validerCloture(@PathVariable UUID interventionId,
                                                          @Valid @RequestBody ClotureRequest request,
                                                          Authentication auth) {
        UUID employeId = ((UserPrincipal) auth.getPrincipal()).getId();
        return ResponseEntity.ok(
                rapportService.validerCloture(interventionId, request.getSignature(), employeId));
    }
}