package ma.gmsi.gmsi_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String nom;
    @NotBlank
    private String prenom;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String role;
}