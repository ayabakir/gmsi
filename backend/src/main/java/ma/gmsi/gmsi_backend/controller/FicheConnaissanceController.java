// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/FicheConnaissanceController.java
package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.FicheConnaissanceResponse;
import ma.gmsi.gmsi_backend.service.FicheConnaissanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/technicien/connaissances")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TECHNICIEN', 'RESPONSABLE', 'ADMIN')")
public class FicheConnaissanceController {

    private final FicheConnaissanceService ficheService;

    // GET /api/technicien/connaissances/recherche?categorieId=X&motCle=Y
    @GetMapping("/recherche")
    public ResponseEntity<List<FicheConnaissanceResponse>> rechercher(
            @RequestParam(required = false) UUID categorieId,
            @RequestParam(required = false) String motCle) {
        return ResponseEntity.ok(ficheService.rechercher(categorieId, motCle));
    }

    // GET /api/technicien/connaissances/{id}
    @GetMapping("/{id}")
    public ResponseEntity<FicheConnaissanceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ficheService.getById(id));
    }

    // GET /api/technicien/connaissances/
    @GetMapping("/")
    public ResponseEntity<List<FicheConnaissanceResponse>> listerToutes() {
        return ResponseEntity.ok(ficheService.listerToutes());
    }
}