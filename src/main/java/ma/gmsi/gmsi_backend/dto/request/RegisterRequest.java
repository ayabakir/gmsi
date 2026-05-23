package ma.gmsi.gmsi_backend.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;
    private String role;
}