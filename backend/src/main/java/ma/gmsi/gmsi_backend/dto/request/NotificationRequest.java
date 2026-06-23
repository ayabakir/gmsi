// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/NotificationRequest.java

package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record NotificationRequest(

        @NotNull(message = "L'identifiant du destinataire est obligatoire")
        UUID destinataireId,

        @NotBlank(message = "Le code du template est obligatoire")
        String codeTemplate,

        // Variables à substituer dans le template (clé = nom variable, valeur = valeur)
        // Exemple : {"nomTechnicien": "Ahmed", "refDemande": "DEM-001"}
        Map<String, String> variables
) {}