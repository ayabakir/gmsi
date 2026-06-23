// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/FicheConnaissanceRequest.java
package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class FicheConnaissanceRequest {

    @NotBlank(message = "Le type de panne est obligatoire")
    private String typePanne;

    @NotBlank(message = "La solution est obligatoire")
    private String solution;

    private String equipementCible;

    private UUID categorieId;

    private List<String> motsCles;
}