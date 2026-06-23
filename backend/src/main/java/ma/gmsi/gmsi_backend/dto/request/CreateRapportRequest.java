package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRapportRequest {

    @NotNull(message = "L'intervention est obligatoire")
    private UUID interventionId;

    @NotBlank(message = "La cause de la panne est obligatoire")
    private String causePanne;

    private String observations;

    // Liste des pièces utilisées (optionnelle — peut être vide)
    private List<PieceUtiliseeRequest> piecesUtilisees;
}