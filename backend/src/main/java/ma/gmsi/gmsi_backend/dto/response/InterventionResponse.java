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
public class InterventionResponse {
    private UUID id;
    private String reference;
    private String statut;
    private String niveauPriorite;
    private String niveauDifficulte;

    private LocalDateTime datePlanifiee;
    private LocalDateTime dateDebutReelle;
    private LocalDateTime dateFinReelle;
    private boolean clotureValidee;
    private LocalDateTime dateCloture;

    // Demande liée
    private UUID demandeId;
    private String demandeReference;
    private String demandeDescription;

    // Responsable
    private UUID responsableId;
    private String responsableNom;

    // Technicien affecté
    private UUID technicienId;
    private String technicienNom;
}