package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.CreateDemandeRequest;
import ma.gmsi.gmsi_backend.dto.response.DemandeResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.DemandeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employe/demandes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYE')")
public class DemandeEmployeController {

    private final DemandeService demandeService;

    @PostMapping
    public ResponseEntity<DemandeResponse> creer(@Valid @RequestBody CreateDemandeRequest request,
                                                 Authentication auth) {
        UUID employeId = getUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(demandeService.creer(request, employeId));
    }

    @GetMapping
    public ResponseEntity<List<DemandeResponse>> mesDemandes(Authentication auth) {
        return ResponseEntity.ok(demandeService.mesDemandes(getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeResponse> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(demandeService.getById(id));
    }

    private UUID getUserId(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getId();
    }
}