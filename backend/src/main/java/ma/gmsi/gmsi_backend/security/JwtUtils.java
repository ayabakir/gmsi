package ma.gmsi.gmsi_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
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
 * - Chaque requête contient toutes les infos dans le token
 * - Secret externalisé dans application.properties
 */

@Component
public class JwtUtils {

    @Value("${gmsi.jwt.secret}")
    private String secretKey;

    @Value("${gmsi.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Générer un token JWT
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
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