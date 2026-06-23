// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/FicheConnaissanceResponse.java
package ma.gmsi.gmsi_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class FicheConnaissanceResponse {

    private UUID id;
    private LocalDateTime dateCreation;
    private String equipementCible;
    private String solution;
    private String typePanne;
    private List<String> motsCles;

    // Depuis la relation Categorie
    private String libelleCategorie;

    // Depuis la relation RapportTechnique (référence lisible)
    private String refRapportSource;
}