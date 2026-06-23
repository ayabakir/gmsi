// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/NotificationTemplateRequest.java

package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ma.gmsi.gmsi_backend.entity.enums.TypeNotification;

public record NotificationTemplateRequest(

        @NotBlank(message = "Le code du template est obligatoire")
        String code,

        @NotBlank(message = "Le sujet est obligatoire")
        String sujet,

        @NotBlank(message = "Le corps du template est obligatoire")
        String corps,

        @NotNull(message = "Le type de notification est obligatoire")
        TypeNotification type
) {}