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
public class CreateDemandeRequest {

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "L'équipement est obligatoire")
    private UUID equipementId;

    @NotBlank(message = "Le niveau d'urgence est obligatoire")
    private String niveauUrgence; // BASSE, MOYENNE, HAUTE, CRITIQUE

    private UUID categorieId;     // optionnel
    private UUID localisationId;  // optionnel
}