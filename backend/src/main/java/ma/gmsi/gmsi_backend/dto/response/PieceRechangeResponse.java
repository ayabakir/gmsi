// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/PieceRechangeResponse.java

package ma.gmsi.gmsi_backend.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceRechangeResponse {

    private UUID id;
    private String nom;
    private String reference;
    private String description;
    private int stockDisponible;
    private int seuilAlerte;
    private boolean sousSeuilAlerte;
}