// src/main/java/ma/gmsi/gmsi_backend/dto/request/LocalisationRequest.java
package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.gmsi.gmsi_backend.entity.enums.TypeLocalisation;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalisationRequest {

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    @NotNull(message = "Le type est obligatoire")
    private TypeLocalisation type;

    // Optionnel : null = racine (ex: Bâtiment)
    private UUID parentId;
}