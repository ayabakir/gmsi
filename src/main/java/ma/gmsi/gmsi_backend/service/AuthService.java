package ma.gmsi.gmsi_backend.service;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.LoginRequest;
import ma.gmsi.gmsi_backend.dto.request.RegisterRequest;
import ma.gmsi.gmsi_backend.dto.response.AuthResponse;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import ma.gmsi.gmsi_backend.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        Utilisateur user = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .actif(true)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(
                user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        Utilisateur user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String token = jwtUtils.generateToken(
                user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }
}