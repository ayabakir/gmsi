package ma.gmsi.gmsi_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

/*
 * SANS SPRING :
 * - Gestion manuelle des sessions HttpSession
 * - session.setAttribute("user", user) à chaque login
 * - Pas de token, état stocké côté serveur
 * AVEC JWT + SPRING :
 * - Token généré côté serveur, stocké côté client
 * - Stateless : Spring n'a pas besoin de mémoriser la session
 * - Chaque requête contient toutes les infos nécessaires dans le token
 */

@Component
public class JwtUtils {

    private final String SECRET_KEY =
            "gmsi_secret_key_2026_very_long_secure_key_minimum_256_bits!!";

    private final long EXPIRATION_MS = 86400000; // 24h

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Générer un token JWT
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSigningKey())
                .compact();
    }

    // Extraire l'email depuis le token
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Vérifier si le token est valide
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}