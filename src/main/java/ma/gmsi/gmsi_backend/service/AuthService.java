package ma.gmsi.gmsi_backend.service;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.LoginRequest;
import ma.gmsi.gmsi_backend.dto.request.RegisterRequest;
import ma.gmsi.gmsi_backend.dto.response.AuthResponse;
import ma.gmsi.gmsi_backend.entity.Role;
import ma.gmsi.gmsi_backend.entity.User;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import ma.gmsi.gmsi_backend.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/*
 * SANS SPRING :
 * - Vérification manuelle : SELECT * FROM users WHERE email = ?
 * - Comparaison password en clair ou MD5 (non sécurisé)
 * - Création manuelle de session HttpSession
 * AVEC SPRING :
 * - AuthenticationManager gère la vérification automatiquement
 * - BCryptPasswordEncoder encode et vérifie le password
 * - JWT généré et renvoyé au client (stateless)
 */

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // Inscription
    public AuthResponse register(RegisterRequest request) {

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        // Créer l'utilisateur
        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .role(Role.valueOf(request.getRole()))
                .actif(true)
                .build();

        userRepository.save(user);

        // Générer le token JWT
        String token = jwtUtils.generateToken(
                user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }

    // Connexion
    public AuthResponse login(LoginRequest request) {

        // Spring vérifie email + password automatiquement
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        // Récupérer l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Générer le token JWT
        String token = jwtUtils.generateToken(
                user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }
}