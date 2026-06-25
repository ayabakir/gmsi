// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/DashboardResponsableResponse.java
package ma.gmsi.gmsi_backend.dto.response;

import java.util.List;
import java.util.Map;

/**
 * Réponse complète du dashboard RESPONSABLE (R-US5, R-US9).
 *
 * - demandesParStatut    : clé = nom de l'enum StatutDemande (String), valeur = count
 * - mttrHeures           : null si aucune intervention CLOTUREE
 * - tauxPannesParCategorie : clé = nom de la catégorie, valeur = count demandes
 * - topTechniciens       : top 5 par scorePondere DESC
 * - piecesSousSeuilAlerte : count simple (PieceRechangeRepository)
 * - chargeTechniciens    : charge de chaque technicien actif
 */
public record DashboardResponsableResponse(
        Map<String, Long>         demandesParStatut,
        Double                    mttrHeures,
        Map<String, Long>         tauxPannesParCategorie,
        List<TopTechnicienDTO>    topTechniciens,
        Long                      piecesSousSeuilAlerte,
        List<ChargeTechnicienDTO> chargeTechniciens
) {}