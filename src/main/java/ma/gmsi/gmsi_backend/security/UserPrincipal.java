// src/main/java/ma/gmsi/gmsi_backend/security/UserPrincipal.java
package ma.gmsi.gmsi_backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

/**
 * Implémentation de {@link UserDetails} adaptée au modèle métier de GMSI.
 *
 * <p>Spring Security ne connaît nativement que le username (ici l'email).
 * Cette classe enrichit ce contrat avec l'UUID réel de l'utilisateur connecté,
 * afin que les services métier (mouvements de stock, notifications, audit...)
 * puissent l'utiliser sans requête supplémentaire en base.</p>
 */
public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String motDePasse;
    private final boolean actif;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String email, String motDePasse, boolean actif,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.motDePasse = motDePasse;
        this.actif = actif;
        this.authorities = authorities;
    }

    /**
     * UUID réel de l'utilisateur connecté, utilisable directement dans les
     * services métier (ex: pour tracer qui a déclenché un mouvement de stock).
     */
    public UUID getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return motDePasse;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return actif;
    }
}