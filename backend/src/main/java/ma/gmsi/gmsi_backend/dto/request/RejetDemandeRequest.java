package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejetDemandeRequest {
    @NotBlank(message = "Le motif de rejet est obligatoire")
    private String motif;
}