package ma.gmsi.gmsi_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeResponse {
    private UUID id;
    private String reference;
    private String description;
    private String statut;
    private String niveauUrgence;
    private String motifRejet;

    private UUID employeId;
    private String employeNom;

    private UUID equipementId;
    private String equipementNom;

    private UUID categorieId;
    private String categorieLibelle;

    private UUID localisationId;
    private String localisationLibelle;

    private LocalDateTime dateCreation;


    // Lien vers l'intervention (pour clôture + évaluation côté employé)
    private UUID interventionId;

}