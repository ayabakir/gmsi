package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import ma.gmsi.gmsi_backend.entity.enums.StatutEquipement;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipementRequest {

    private String reference;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le type est obligatoire")
    private String type;

    private StatutEquipement statut;

    private String description;

    @NotNull(message = "La localisation est obligatoire")
    private UUID localisationId;

    private LocalDate dateMiseEnService;
}