// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/RechercheConnaissanceRequest.java
package ma.gmsi.gmsi_backend.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class RechercheConnaissanceRequest {

    private UUID categorieId;   // optionnel

    private String motCle;      // optionnel
}