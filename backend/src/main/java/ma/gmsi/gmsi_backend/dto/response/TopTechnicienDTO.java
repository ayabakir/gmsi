// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/TopTechnicienDTO.java
package ma.gmsi.gmsi_backend.dto.response;

/**
 * Projection utilisée dans DashboardResponsableResponse.topTechniciens.
 * scorePondere vient de ScoreTechnicien.scorePondere (BigDecimal → double).
 */
public record TopTechnicienDTO(
        String nomComplet,
        Double scorePondere,
        Integer nbEvaluations
) {}