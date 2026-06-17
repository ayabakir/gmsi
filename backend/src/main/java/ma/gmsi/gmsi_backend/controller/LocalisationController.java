// src/main/java/ma/gmsi/gmsi_backend/controller/LocalisationController.java
package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.LocalisationRequest;
import ma.gmsi.gmsi_backend.dto.response.LocalisationResponse;
import ma.gmsi.gmsi_backend.service.LocalisationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/localisations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LocalisationController {

    private final LocalisationService localisationService;

    @PostMapping
    public ResponseEntity<LocalisationResponse> create(@Valid @RequestBody LocalisationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(localisationService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<LocalisationResponse>> findAll() {
        return ResponseEntity.ok(localisationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalisationResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(localisationService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalisationResponse> update(@PathVariable UUID id,
                                                       @Valid @RequestBody LocalisationRequest request) {
        return ResponseEntity.ok(localisationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        localisationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/racines")
    public ResponseEntity<List<LocalisationResponse>> findRacines() {
        return ResponseEntity.ok(localisationService.findRacines());
    }

    @GetMapping("/{id}/enfants")
    public ResponseEntity<List<LocalisationResponse>> findEnfants(@PathVariable UUID id) {
        return ResponseEntity.ok(localisationService.findEnfants(id));
    }
}