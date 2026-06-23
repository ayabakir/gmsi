// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/ParametreController.java
package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.ParametreRequest;
import ma.gmsi.gmsi_backend.dto.response.ParametreResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.ParametreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des paramètres système.
 * Couverture CDC : A-US6 (Gérer les paramètres système).
 * Accès réservé au rôle ADMIN.
 */
@RestController
@RequestMapping("/api/admin/parametres")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ParametreController {

    private final ParametreService parametreService;

    @GetMapping
    public ResponseEntity<List<ParametreResponse>> listerTous() {
        return ResponseEntity.ok(parametreService.listerTous());
    }

    @GetMapping("/{cle}")
    public ResponseEntity<ParametreResponse> getByCle(@PathVariable String cle) {
        return ResponseEntity.ok(parametreService.getByCle(cle));
    }

    @PutMapping("/{cle}")
    public ResponseEntity<ParametreResponse> modifier(
            @PathVariable String cle,
            @Valid @RequestBody ParametreRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        ParametreResponse response = parametreService.modifier(
                cle, request, userPrincipal.getId());

        return ResponseEntity.ok(response);
    }
}