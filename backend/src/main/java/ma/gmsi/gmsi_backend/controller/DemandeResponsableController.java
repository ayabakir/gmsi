package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.RejetDemandeRequest;
import ma.gmsi.gmsi_backend.dto.response.DemandeResponse;
import ma.gmsi.gmsi_backend.service.DemandeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/responsable/demandes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE') or hasRole('ADMIN')")
public class DemandeResponsableController {

    private final DemandeService demandeService;

    // Liste toutes les demandes, filtre optionnel ?statut=EN_ATTENTE
    @GetMapping
    public ResponseEntity<List<DemandeResponse>> toutes(
            @RequestParam(required = false) String statut) {
        return ResponseEntity.ok(demandeService.toutes(statut));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeResponse> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(demandeService.getById(id));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<DemandeResponse> valider(@PathVariable UUID id) {
        return ResponseEntity.ok(demandeService.valider(id));
    }

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<DemandeResponse> rejeter(@PathVariable UUID id,
                                                   @Valid @RequestBody RejetDemandeRequest request) {
        return ResponseEntity.ok(demandeService.rejeter(id, request.getMotif()));
    }
}