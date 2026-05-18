package ma.gmsi.gmsi_backend.security;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

/*
 * SANS SPRING :
 * - Vérification manuelle en session HttpSession
 * - Comparaison mot de passe en clair dans la BDD
 * AVEC SPRING SECURITY :
 * - Interface UserDetailsService standard
 * - Spring gère l'encodage + la vérification automatiquement
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

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}