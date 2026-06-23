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
public class EvaluationResponse {
    private UUID id;
    private UUID interventionId;
    private String interventionReference;
    private int note;
    private String commentaire;
    private String niveauDifficulte;
    private UUID technicienId;
    private String technicienNom;
    private LocalDateTime dateEvaluation;
}