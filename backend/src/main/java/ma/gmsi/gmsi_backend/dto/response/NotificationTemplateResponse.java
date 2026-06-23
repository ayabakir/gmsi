// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/NotificationTemplateResponse.java

package ma.gmsi.gmsi_backend.dto.response;

import ma.gmsi.gmsi_backend.entity.enums.TypeNotification;

import java.util.UUID;

public record NotificationTemplateResponse(
        UUID id,
        String code,
        String sujet,
        String corps,
        TypeNotification type
) {}