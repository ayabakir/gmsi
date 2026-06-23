// src/main/java/ma/gmsi/gmsi_backend/exception/GlobalExceptionHandler.java
package ma.gmsi.gmsi_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> erreurs = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String champ = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            erreurs.put(champ, message);
        });
        return ResponseEntity.badRequest().body(Map.of(
                "statut", 400,
                "erreur", "Données invalides",
                "champs", erreurs,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "statut", 404,
                "erreur", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            BadRequestException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "statut", 400,
                "erreur", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccesDenie(
            AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "statut", 403,
                "erreur", "Accès refusé — permissions insuffisantes",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ CORRIGÉ — même pattern Map<String, Object> que les autres handlers
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(
            HttpMessageNotReadableException ex) {

        String detail = "Valeur invalide dans le corps de la requête.";

        Throwable cause = ex.getCause();
        if (cause instanceof com.fasterxml.jackson.databind.exc.InvalidFormatException ife) {
            if (ife.getTargetType() != null && ife.getTargetType().isEnum()) {
                detail = "Valeur '" + ife.getValue() + "' invalide. "
                        + "Valeurs acceptées : "
                        + java.util.Arrays.stream(ife.getTargetType().getEnumConstants())
                        .map(Object::toString)
                        .collect(java.util.stream.Collectors.joining(", "));
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "statut", 400,
                "erreur", "Requête invalide",
                "detail", detail,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAutres(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "statut", 500,
                "erreur", "Erreur interne du serveur",
                "detail", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}