// src/main/java/ma/gmsi/gmsi_backend/dto/request/CategorieRequest.java
package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieRequest {

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    private String description;
}