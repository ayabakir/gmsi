// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/PushSubscriptionRequest.java

package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PushSubscriptionRequest(

        @NotBlank(message = "L'endpoint Push est obligatoire")
        String endpoint,

        @NotBlank(message = "La clé p256dh est obligatoire")
        String p256dh,

        @NotBlank(message = "La clé auth est obligatoire")
        String auth
) {}