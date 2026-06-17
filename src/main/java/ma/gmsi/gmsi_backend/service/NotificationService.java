// src/main/java/ma/gmsi/gmsi_backend/service/NotificationService.java
package ma.gmsi.gmsi_backend.service;

import java.util.List;
import java.util.UUID;

/**
 * Service d'envoi et de gestion des notifications utilisateur.
 *
 * <p>Exposé par le module Notifications (Ikram), appelé par le module
 * Interventions/Fiches (Aya) à chaque transition d'état d'une entité métier
 * (par exemple : intervention créée, affectée, en cours, terminée, validée).</p>
 */
public interface NotificationService {

    /**
     * Notifie un utilisateur d'un changement d'état sur une entité métier
     * (intervention, fiche, demande, etc.).
     *
     * @param destinataireId identifiant de l'utilisateur à notifier
     * @param entiteType     type de l'entité concernée (ex: "INTERVENTION", "FICHE")
     * @param entiteId       identifiant de l'entité concernée
     * @param ancienEtat     état précédent (peut être null si création)
     * @param nouvelEtat     nouvel état atteint
     */
    void notifierChangementEtat(UUID destinataireId, String entiteType, UUID entiteId,
                                String ancienEtat, String nouvelEtat);

    /**
     * Envoie une notification libre (message personnalisé) à un utilisateur.
     *
     * @param destinataireId identifiant de l'utilisateur à notifier
     * @param titre          titre court de la notification
     * @param message        contenu détaillé de la notification
     */
    void envoyerNotification(UUID destinataireId, String titre, String message);

    /**
     * Liste les notifications non lues d'un utilisateur, des plus récentes
     * aux plus anciennes.
     *
     * @param utilisateurId identifiant de l'utilisateur
     * @return liste des notifications non lues
     */
    List<NotificationDTO> consulterNonLues(UUID utilisateurId);

    /**
     * Marque une notification comme lue.
     *
     * @param notificationId identifiant de la notification
     */
    void marquerCommeLue(UUID notificationId);

    /**
     * Représentation simplifiée d'une notification, utilisée comme type de
     * retour en attendant le DTO définitif du module Notifications.
     */
    record NotificationDTO(
            UUID id,
            UUID destinataireId,
            String titre,
            String message,
            boolean lue,
            String dateCreation // ISO-8601, en attendant le type définitif (Instant/LocalDateTime)
    ) {}
}