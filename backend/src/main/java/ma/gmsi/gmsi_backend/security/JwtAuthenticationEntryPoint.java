// src/main/java/ma/gmsi/gmsi_backend/security/JwtAuthenticationEntryPoint.java
package ma.gmsi.gmsi_backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Point d'entrée d'authentification personnalisé.
 *
 * Par défaut, Spring Security renvoie 403 (Forbidden) aussi bien quand
 * l'utilisateur n'est pas authentifié du tout que lorsqu'il l'est mais
 * n'a pas le rôle requis. Cette classe corrige ce comportement pour
 * respecter la sémantique HTTP standard :
 *   - 401 (Unauthorized) : aucun token / token invalide ou expiré
 *     → géré ICI
 *   - 403 (Forbidden)    : token valide mais rôle insuffisant
 *     → toujours géré par GlobalExceptionHandler#handleAccesDenie,
 *       via AccessDeniedException (inchangé)
 *
 * Spring Security invoque automatiquement commence() dès qu'une
 * AuthenticationException remonte sur une route protégée (ex: pas de
 * token JWT du tout, ou token invalide/expiré rejeté par
 * JwtAuthenticationFilter).
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = Map.of(
                "statut", 401,
                "erreur", "Authentification requise — token absent, invalide ou expiré",
                "timestamp", LocalDateTime.now().toString()
        );

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}