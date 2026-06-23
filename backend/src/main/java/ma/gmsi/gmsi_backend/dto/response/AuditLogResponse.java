// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/AuditLogResponse.java
package ma.gmsi.gmsi_backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de réponse exposant une entrée de l'audit log.
 * emailUtilisateur est résolu depuis idUtilisateur (lookup côté
 * AuditLogServiceImpl, AuditLog n'a pas de relation JPA directe
 * vers Utilisateur — juste l'UUID brut).
 */
public record AuditLogResponse(

        UUID id,
        String action,
        String entiteType,
        UUID idEntite,
        String emailUtilisateur,
        String details,
        LocalDateTime dateAction

) {
}