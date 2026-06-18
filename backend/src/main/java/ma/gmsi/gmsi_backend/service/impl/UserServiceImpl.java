package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.CreateUserRequest;
import ma.gmsi.gmsi_backend.dto.request.UpdateUserRequest;
import ma.gmsi.gmsi_backend.dto.response.UserResponse;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import ma.gmsi.gmsi_backend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email déjà utilisé : " + request.getEmail());
        }

        Utilisateur user = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(parseRole(request.getRole()))
                .actif(true)
                .build();

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findByRole(String role) {
        return userRepository.findByRole(parseRole(role))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return toResponse(getUserOrThrow(id));
    }

    @Override
    public UserResponse update(UUID id, UpdateUserRequest request) {
        Utilisateur user = getUserOrThrow(id);

        // Si l'email change, vérifier qu'il n'est pas déjà pris par un autre
        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email déjà utilisé : " + request.getEmail());
        }

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setRole(parseRole(request.getRole()));

        return toResponse(userRepository.save(user));
    }

    @Override
    public void activer(UUID id) {
        Utilisateur user = getUserOrThrow(id);
        user.setActif(true);
        userRepository.save(user);
    }

    @Override
    public void desactiver(UUID id) {
        Utilisateur user = getUserOrThrow(id);
        user.setActif(false);
        userRepository.save(user);
    }

    @Override
    public void delete(UUID id) {
        Utilisateur user = getUserOrThrow(id);
        userRepository.delete(user);
    }

    // ---------- méthodes utilitaires ----------

    private Utilisateur getUserOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur introuvable avec l'id : " + id));
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Rôle invalide : " + role
                    + " (valeurs autorisées : EMPLOYE, RESPONSABLE, TECHNICIEN, ADMIN)");
        }
    }

    private UserResponse toResponse(Utilisateur user) {
        return UserResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .actif(user.isActif())
                .dateCreation(user.getDateCreation())
                .build();
    }
}