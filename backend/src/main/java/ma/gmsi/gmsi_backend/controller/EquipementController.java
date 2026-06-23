// src/main/java/ma/gmsi/gmsi_backend/controller/EquipementController.java
package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.EquipementRequest;
import ma.gmsi.gmsi_backend.dto.response.EquipementResponse;
import ma.gmsi.gmsi_backend.service.EquipementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/equipements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EquipementController {

    private final EquipementService equipementService;

    @PostMapping
    public ResponseEntity<EquipementResponse> create(@Valid @RequestBody EquipementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipementService.create(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EquipementResponse>> findAll() {
        return ResponseEntity.ok(equipementService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EquipementResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(equipementService.findById(id));
    }

    @GetMapping("/localisation/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EquipementResponse>> findByLocalisation(@PathVariable UUID id) {
        return ResponseEntity.ok(equipementService.findByLocalisation(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipementResponse> update(@PathVariable UUID id,
                                                     @Valid @RequestBody EquipementRequest request) {
        return ResponseEntity.ok(equipementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        equipementService.delete(id);
        return ResponseEntity.noContent().build();
    }

}