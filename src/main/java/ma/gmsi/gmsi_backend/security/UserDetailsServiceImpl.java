package ma.gmsi.gmsi_backend.security;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

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
                user.getMotDePasse(),
                user.isActif(),   // ← Fix champ actif
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}