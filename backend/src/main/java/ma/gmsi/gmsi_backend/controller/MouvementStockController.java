// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/MouvementStockController.java

package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.MouvementStockRequest;
import ma.gmsi.gmsi_backend.dto.response.MouvementStockResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.MouvementStockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/responsable/stock/mouvements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE') or hasRole('ADMIN')")
public class MouvementStockController {

    private final MouvementStockService mouvementStockService;

    @GetMapping
    public ResponseEntity<List<MouvementStockResponse>> listerMouvements() {
        return ResponseEntity.ok(mouvementStockService.listerMouvements());
    }

    @GetMapping("/piece/{pieceId}")
    public ResponseEntity<List<MouvementStockResponse>> getMouvementsByPiece(@PathVariable UUID pieceId) {
        return ResponseEntity.ok(mouvementStockService.getMouvementsByPiece(pieceId));
    }

    @PostMapping("/entree")
    public ResponseEntity<MouvementStockResponse> creerEntree(@Valid @RequestBody MouvementStockRequest request,
                                                              Authentication authentication) {
        UUID userId = getCurrentUserId(authentication);

        MouvementStockResponse response = mouvementStockService.creerEntree(
                request.getPieceId(), request.getQuantite(), request.getMotif(), userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/sortie")
    public ResponseEntity<MouvementStockResponse> creerSortie(@Valid @RequestBody MouvementStockRequest request,
                                                              Authentication authentication) {
        UUID userId = getCurrentUserId(authentication);

        MouvementStockResponse response = mouvementStockService.creerSortie(
                request.getPieceId(), request.getQuantite(), request.getMotif(), userId, null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private UUID getCurrentUserId(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getId();
    }
}