package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceUtiliseeRequest {

    @NotNull(message = "La pièce est obligatoire")
    private UUID pieceId;

    @Positive(message = "La quantité doit être positive")
    private int quantite;
}