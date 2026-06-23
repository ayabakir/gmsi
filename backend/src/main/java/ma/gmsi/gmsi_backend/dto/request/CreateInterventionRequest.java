package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterventionRequest {

    @NotNull(message = "La demande est obligatoire")
    private UUID demandeId;

    @NotNull(message = "Le technicien est obligatoire")
    private UUID technicienId;

    @NotBlank(message = "Le niveau de priorité est obligatoire")
    private String niveauPriorite;   // BASSE, MOYENNE, HAUTE, CRITIQUE

    @NotBlank(message = "Le niveau de difficulté est obligatoire")
    private String niveauDifficulte; // FACILE, MOYEN, DIFFICILE, CRITIQUE

    private LocalDateTime datePlanifiee; // optionnel
}