package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClotureRequest {
    @NotBlank(message = "La signature est obligatoire pour valider la clôture")
    private String signature;
}