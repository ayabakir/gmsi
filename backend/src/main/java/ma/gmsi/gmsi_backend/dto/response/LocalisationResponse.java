// src/main/java/ma/gmsi/gmsi_backend/dto/response/LocalisationResponse.java
package ma.gmsi.gmsi_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.gmsi.gmsi_backend.entity.enums.TypeLocalisation;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalisationResponse {

    private UUID id;
    private String libelle;
    private TypeLocalisation type;
    private UUID parentId;
    private String parentLibelle;
    private String description;
    private String cheminComplet;

    // Optionnel : utilisé uniquement pour /enfants ou /racines avec arborescence
    private List<LocalisationResponse> enfants;
}