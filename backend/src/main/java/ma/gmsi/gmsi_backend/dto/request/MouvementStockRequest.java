// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/MouvementStockRequest.java

package ma.gmsi.gmsi_backend.dto.request;

import ma.gmsi.gmsi_backend.entity.enums.TypeMouvement;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MouvementStockRequest {

    @NotNull(message = "L'identifiant de la pièce est obligatoire")
    private UUID pieceId;

    @NotNull(message = "Le type de mouvement est obligatoire")
    private TypeMouvement type;

    @Min(value = 1, message = "La quantité doit être supérieure à 0")
    private int quantite;

    private String motif;
}