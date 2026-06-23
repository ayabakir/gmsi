// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/AuditLogService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.response.AuditLogResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service de consultation de l'audit log.
 * Couverture CDC : A-US7 (Consulter l'audit log).
 *
 * Aucune méthode de ce service n'est annotée @Auditable : on n'audite
 * pas la consultation de l'audit lui-même (boucle de logs inutile).
 */
public interface AuditLogService {

    /**
     * Recherche les entrées d'audit selon des filtres dynamiques.
     * Tous les paramètres sont facultatifs (nullable) — seuls les
     * critères non-null sont appliqués.
     *
     * @param idUtilisateur filtre par utilisateur ayant réalisé l'action (optionnel)
     * @param entiteType    filtre par type d'entité concernée (optionnel)
     * @param dateDebut     borne basse de la période (optionnel)
     * @param dateFin       borne haute de la période (optionnel)
     */
    List<AuditLogResponse> rechercher(UUID idUtilisateur, String entiteType,
                                      LocalDateTime dateDebut, LocalDateTime dateFin);

    /**
     * Liste l'intégralité de l'audit log, sans filtre.
     */
    List<AuditLogResponse> listerTous();

    /**
     * Génère le contenu CSV de l'audit log filtré, pour téléchargement
     * côté frontend.
     * Mêmes paramètres facultatifs que rechercher().
     *
     * @return le contenu CSV complet sous forme de String
     */
    String exporterCsv(UUID idUtilisateur, String entiteType,
                       LocalDateTime dateDebut, LocalDateTime dateFin);

}