// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/AuditLogFiltreRequest.java
package ma.gmsi.gmsi_backend.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de filtre pour la consultation de l'audit log.
 * Utilisé en query params (GET), pas en body — tous les champs
 * sont facultatifs pour permettre un filtre dynamique combiné.
 */
public record AuditLogFiltreRequest(

        UUID idUtilisateur,
        String entiteType,
        LocalDateTime dateDebut,
        LocalDateTime dateFin

) {
}