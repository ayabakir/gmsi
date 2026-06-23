package ma.gmsi.gmsi_backend.dto.request;

import lombok.Data;

@Data
public class ChangerStatutRequest {
    private String commentaire; // optionnel, accompagne le changement de statut
}