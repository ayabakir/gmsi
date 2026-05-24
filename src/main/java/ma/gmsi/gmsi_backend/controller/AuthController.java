package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.LoginRequest;
import ma.gmsi.gmsi_backend.dto.request.RegisterRequest;
import ma.gmsi.gmsi_backend.dto.response.AuthResponse;
import ma.gmsi.gmsi_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 * SANS SPRING :
 * - Servlet manuelle extends HttpServlet
 * - doPost() pour traiter les requêtes
 * - Parsing manuel du JSON
 * AVEC SPRING MVC :
 * - @RestController gère automatiquement JSON
 * - @PostMapping mappe l'URL à la méthode
 * - @RequestBody désérialise automatiquement le JSON
 * - @Valid déclenche automatiquement la validation des DTOs
 */

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}