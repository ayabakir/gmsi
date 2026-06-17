// src/main/java/ma/gmsi/gmsi_backend/dto/response/EquipementResponse.java
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
public class EquipementResponse {

    private UUID id;
    private String nom;
    private String type;
    private String description;
    private UUID localisationId;
    private String localisationLibelle;
}