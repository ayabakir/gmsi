package ma.gmsi.gmsi_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreResponse {
    private UUID technicienId;
    private String technicienNom;
    private BigDecimal scorePondere;
    private BigDecimal noteBruteMoyenne;
    private int nbEvaluations;
    private LocalDateTime dateCalcul;
}