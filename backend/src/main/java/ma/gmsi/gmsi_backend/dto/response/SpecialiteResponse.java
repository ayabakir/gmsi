package ma.gmsi.gmsi_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialiteResponse {
    private UUID id;
    private UUID technicienId;
    private String technicienNom;     // nom + prénom pour l'affichage
    private UUID categorieId;
    private String categorieLibelle;  // libellé pour l'affichage
    private String niveau;
}