// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/request/ParametreRequest.java
package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO de requête pour la modification d'un paramètre système.
 * La clé n'est jamais modifiable une fois créée — seulement la valeur
 * et la description.
 */
public record ParametreRequest(

        @NotBlank(message = "La valeur ne peut pas être vide")
        String valeur,

        String description

) {
}