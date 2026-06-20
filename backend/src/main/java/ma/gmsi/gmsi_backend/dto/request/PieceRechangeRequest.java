// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/PieceRechangeRequest.java

package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceRechangeRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "La référence est obligatoire")
    private String reference;

    private String description;

    @Min(value = 0, message = "Le stock disponible ne peut pas être négatif")
    private int stockDisponible;

    @Min(value = 0, message = "Le seuil d'alerte ne peut pas être négatif")
    private int seuilAlerte;
}