// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/MouvementStockResponse.java

package ma.gmsi.gmsi_backend.dto.response;

import ma.gmsi.gmsi_backend.entity.enums.TypeMouvement;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MouvementStockResponse {

    private UUID id;
    private TypeMouvement type;
    private int quantite;
    private String motif;
    private LocalDateTime dateMouvement;
    private String nomPiece;
    private String emailUtilisateur;
    private UUID idIntervention;
}