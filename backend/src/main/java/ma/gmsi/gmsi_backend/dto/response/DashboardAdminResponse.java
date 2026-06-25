// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/DashboardAdminResponse.java
package ma.gmsi.gmsi_backend.dto.response;

import java.util.List;
import java.util.Map;

/**
 * Réponse complète du dashboard ADMIN (vue système globale).
 *
 * - nbUtilisateursParRole    : clé = nom de l'enum Role (String), valeur = count
 * - nbUtilisateursActifs     : COUNT WHERE actif = true
 * - nbUtilisateursInactifs   : COUNT WHERE actif = false
 * - nbActionsAuditRecentes   : COUNT sur les 24 dernières heures
 * - parametresCoeffs         : les 4 COEFF_* (cle → valeur String)
 * - dernieresActionsAudit    : 10 dernières entrées, tri dateAction DESC
 *                              Réutilise AuditLogResponse (Module I5)
 */
public record DashboardAdminResponse(
        Map<String, Long>       nbUtilisateursParRole,
        Long                    nbUtilisateursActifs,
        Long                    nbUtilisateursInactifs,
        Long                    nbActionsAuditRecentes,
        Map<String, String>     parametresCoeffs,
        List<AuditLogResponse>  dernieresActionsAudit
) {}