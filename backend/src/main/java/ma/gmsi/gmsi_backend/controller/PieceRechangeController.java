// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/PieceRechangeController.java

package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.PieceRechangeRequest;
import ma.gmsi.gmsi_backend.dto.response.PieceRechangeResponse;
import ma.gmsi.gmsi_backend.service.MouvementStockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/responsable/stock/pieces")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE') or hasRole('ADMIN')")
public class PieceRechangeController {

    private final MouvementStockService mouvementStockService;

    @GetMapping
    public ResponseEntity<List<PieceRechangeResponse>> listerPieces() {
        return ResponseEntity.ok(mouvementStockService.listerPieces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PieceRechangeResponse> getPiece(@PathVariable UUID id) {
        return ResponseEntity.ok(mouvementStockService.getPiece(id));
    }

    @PostMapping
    public ResponseEntity<PieceRechangeResponse> creerPiece(@Valid @RequestBody PieceRechangeRequest request) {
        PieceRechangeResponse response = mouvementStockService.creerPiece(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PieceRechangeResponse> modifierPiece(@PathVariable UUID id,
                                                               @Valid @RequestBody PieceRechangeRequest request) {
        return ResponseEntity.ok(mouvementStockService.modifierPiece(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerPiece(@PathVariable UUID id) {
        mouvementStockService.supprimerPiece(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alertes")
    public ResponseEntity<List<PieceRechangeResponse>> getPiecesSousSeuilAlerte() {
        return ResponseEntity.ok(mouvementStockService.getPiecesSousSeuilAlerte());
    }
}