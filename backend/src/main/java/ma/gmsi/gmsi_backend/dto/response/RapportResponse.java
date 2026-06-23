package ma.gmsi.gmsi_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportResponse {
    private UUID id;
    private UUID interventionId;
    private String interventionReference;
    private String causePanne;
    private String observations;
    private String signatureEmploye;
    private LocalDateTime dateRapport;

    // Pièces utilisées
    private List<PieceUtiliseeResponse> piecesUtilisees;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PieceUtiliseeResponse {
        private UUID pieceId;
        private String nomPiece;
        private int quantite;
    }
}