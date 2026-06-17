// src/main/java/ma/gmsi/gmsi_backend/security/UserDetailsServiceImpl.java
package ma.gmsi.gmsi_backend.security;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implémentation de {@link UserDetailsService} utilisée par Spring Security
 * lors de l'authentification.
 *
 * <p>Retourne désormais un {@link UserPrincipal} (et non plus un
 * {@code org.springframework.security.core.userdetails.User} générique) afin
 * d'exposer l'UUID métier de l'utilisateur connecté à travers tout le contexte
 * de sécurité.</p>
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur non trouvé : " + email));

        // isEnabled() de UserPrincipal reflète directement user.isActif() :
        // un compte désactivé sera automatiquement rejeté par Spring Security
        // (DisabledException) lors de l'authentification, exactement comme avant.
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getMotDePasse(),
                user.isActif(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}