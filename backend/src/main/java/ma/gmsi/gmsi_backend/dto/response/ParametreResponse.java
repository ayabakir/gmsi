// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/ParametreResponse.java
package ma.gmsi.gmsi_backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de réponse exposant un paramètre système.
 * emailModifiePar est résolu depuis la relation Parametre.modifiePar
 * (peut être null si le paramètre n'a jamais été modifié manuellement,
 * ex: valeurs initiales du DataLoader).
 */
public record ParametreResponse(

        UUID id,
        String cle,
        String valeur,
        String description,
        LocalDateTime dateModification,
        String emailModifiePar

) {
}