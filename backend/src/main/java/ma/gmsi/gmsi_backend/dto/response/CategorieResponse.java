// src/main/java/ma/gmsi/gmsi_backend/dto/response/CategorieResponse.java
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
public class CategorieResponse {

    private UUID id;
    private String libelle;
    private String description;
}