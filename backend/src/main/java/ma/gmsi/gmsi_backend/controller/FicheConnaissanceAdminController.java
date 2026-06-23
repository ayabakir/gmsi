// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/FicheConnaissanceAdminController.java
package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.FicheConnaissanceRequest;
import ma.gmsi.gmsi_backend.dto.response.FicheConnaissanceResponse;
import ma.gmsi.gmsi_backend.service.FicheConnaissanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/connaissances")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FicheConnaissanceAdminController {

    private final FicheConnaissanceService ficheService;

    // POST /api/admin/connaissances
    @PostMapping
    public ResponseEntity<FicheConnaissanceResponse> creerManuelle(
            @Valid @RequestBody FicheConnaissanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ficheService.creerManuelle(request));
    }

    // DELETE /api/admin/connaissances/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        ficheService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}