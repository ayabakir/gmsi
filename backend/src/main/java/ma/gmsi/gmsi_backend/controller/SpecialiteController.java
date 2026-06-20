package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.SpecialiteRequest;
import ma.gmsi.gmsi_backend.dto.response.SpecialiteResponse;
import ma.gmsi.gmsi_backend.service.SpecialiteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/specialites")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SpecialiteController {

    private final SpecialiteService specialiteService;

    @PostMapping
    public ResponseEntity<SpecialiteResponse> create(@Valid @RequestBody SpecialiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(specialiteService.create(request));
    }

    // Lister les spécialités d'un technicien : /api/admin/specialites/technicien/{id}
    @GetMapping("/technicien/{technicienId}")
    public ResponseEntity<List<SpecialiteResponse>> findByTechnicien(
            @PathVariable UUID technicienId) {
        return ResponseEntity.ok(specialiteService.findByTechnicien(technicienId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        specialiteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}