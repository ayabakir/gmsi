// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/DashboardService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.response.DashboardAdminResponse;
import ma.gmsi.gmsi_backend.dto.response.DashboardResponsableResponse;

/**
 * Contrat du service Dashboard (Module I6).
 * Ce module est un point d'arrivée : il n'est consommé par aucun autre service.
 * Pas de Javadoc étendu — la documentation est dans les DTOs.
 */
public interface DashboardService {

    /** Dashboard métier — rôles RESPONSABLE et ADMIN. */
    DashboardResponsableResponse getDashboardResponsable();

    /** Dashboard système — rôle ADMIN uniquement. */
    DashboardAdminResponse getDashboardAdmin();
}