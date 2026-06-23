// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/PreferenceNotifRequest.java

package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import ma.gmsi.gmsi_backend.entity.enums.PreferenceNotif;

public record PreferenceNotifRequest(

        @NotNull(message = "La préférence de notification est obligatoire")
        PreferenceNotif preference
) {}