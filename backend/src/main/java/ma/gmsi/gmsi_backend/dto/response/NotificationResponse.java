// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/NotificationResponse.java

package ma.gmsi.gmsi_backend.dto.response;

import ma.gmsi.gmsi_backend.entity.enums.TypeNotification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        TypeNotification type,
        String message,
        boolean lu,
        LocalDateTime dateEnvoi,
        String emailDestinataire,
        UUID interventionId          // nullable — lien vers l'intervention concernée
) {}