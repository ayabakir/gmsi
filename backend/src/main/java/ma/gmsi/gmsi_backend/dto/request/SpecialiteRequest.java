package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialiteRequest {

    @NotNull(message = "L'identifiant du technicien est obligatoire")
    private UUID technicienId;

    @NotNull(message = "L'identifiant de la catégorie est obligatoire")
    private UUID categorieId;

    @NotBlank(message = "Le niveau est obligatoire")
    private String niveau; // JUNIOR, CONFIRME, EXPERT
}