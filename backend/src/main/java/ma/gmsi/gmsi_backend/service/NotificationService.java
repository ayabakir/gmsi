// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/NotificationService.java

package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.NotificationTemplateRequest;
import ma.gmsi.gmsi_backend.dto.response.NotifCountResponse;
import ma.gmsi.gmsi_backend.dto.response.NotificationResponse;
import ma.gmsi.gmsi_backend.dto.response.NotificationTemplateResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Contrat du service de notifications — MODULE I3.
 *
 * <p>Ce service est TRANSVERSE : il est appelé par tous les modules métier d'Aya
 * (A2 Demande, A3 Intervention, A4 Rapport, A5 Scoring) via la méthode {@link #envoyer}.
 *
 * <p><strong>Règle absolue :</strong> {@link #envoyer} ne doit JAMAIS propager d'exception.
 * Un échec d'envoi (SMTP down, push échoué) est un warning loggé, pas une erreur fatale.
 * L'opération métier appelante (ex: création de demande) ne doit jamais être bloquée
 * par un problème de notification.
 */
public interface NotificationService {

    /**
     * Envoie une notification à un utilisateur selon ses préférences.
     *
     * <p>Le template est récupéré par son {@code codeTemplate} depuis la base de données.
     * Les variables sont substituées dans le corps et le sujet du template via un
     * simple remplacement de chaînes ({@code {nomVariable} → valeur}).
     *
     * <p>La notification est toujours persistée en base (historique), indépendamment
     * du succès de l'envoi email ou push.
     *
     * <p>Selon la {@code preferenceNotif} du destinataire :
     * <ul>
     *   <li>{@code EMAIL} → envoi email uniquement</li>
     *   <li>{@code PUSH}  → envoi push web uniquement</li>
     *   <li>{@code LES_DEUX} → email ET push web</li>
     * </ul>
     *
     * <p><strong>⚠️ Cette méthode ne lève jamais d'exception.</strong>
     * Toute erreur (destinataire introuvable, template manquant, SMTP down)
     * est loggée en WARNING et silencieusement absorbée.
     *
     * @param destinataireId UUID de l'utilisateur destinataire (doit exister en BDD)
     * @param codeTemplate   Code unique du template à utiliser
     *                       (ex: {@code "DEMANDE_ASSIGNEE"}, {@code "MISSION_AFFECTEE"})
     * @param variables      Map des variables à substituer dans le template.
     *                       Les clés correspondent aux placeholders dans le template
     *                       sans les accolades (ex: {@code {"nomTechnicien": "Ahmed",
     *                       "refDemande": "DEM-001"}}).
     *                       Peut être {@code null} ou vide si le template n'a pas de variables.
     *
     * @see ma.gmsi.gmsi_backend.entity.enums.PreferenceNotif
     * @see ma.gmsi.gmsi_backend.entity.NotificationTemplate
     */
    void envoyer(UUID destinataireId, String codeTemplate, Map<String, String> variables);

    /**
     * Retourne toutes les notifications de l'utilisateur connecté,
     * triées de la plus récente à la plus ancienne.
     *
     * @param userId UUID de l'utilisateur connecté (depuis UserPrincipal)
     * @return liste des notifications
     */
    List<NotificationResponse> getMesNotifications(UUID userId);

    /**
     * Retourne le nombre de notifications non lues de l'utilisateur connecté.
     * Utilisé par le badge dans le header React.
     *
     * @param userId UUID de l'utilisateur connecté
     * @return DTO contenant le count
     */
    NotifCountResponse getNonLues(UUID userId);

    /**
     * Marque une notification spécifique comme lue.
     * Vérifie que la notification appartient bien à l'utilisateur (sécurité).
     *
     * @param notifId UUID de la notification à marquer
     * @param userId  UUID de l'utilisateur connecté
     * @return la notification mise à jour
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException si notif introuvable
     * @throws ma.gmsi.gmsi_backend.exception.BadRequestException si notif n'appartient pas à l'utilisateur
     */
    NotificationResponse marquerLue(UUID notifId, UUID userId);

    /**
     * Marque toutes les notifications non lues de l'utilisateur comme lues.
     *
     * @param userId UUID de l'utilisateur connecté
     */
    void marquerToutesLues(UUID userId);

    /**
     * Crée un nouveau template de notification (réservé ADMIN).
     *
     * @param req DTO contenant code, sujet, corps et type
     * @return le template créé
     */
    NotificationTemplateResponse creerTemplate(NotificationTemplateRequest req);

    /**
     * Liste tous les templates de notification disponibles.
     *
     * @return liste des templates
     */
    List<NotificationTemplateResponse> listerTemplates();

    /**
     * Met à jour la préférence de notification d'un utilisateur.
     *
     * @param userId     UUID de l'utilisateur connecté
     * @param preference nouvelle préférence (EMAIL / PUSH / LES_DEUX)
     */
    void mettreAJourPreference(UUID userId, ma.gmsi.gmsi_backend.entity.enums.PreferenceNotif preference);

    /**
     * Enregistre un abonnement Push Web pour un utilisateur.
     * L'abonnement est stocké en mémoire (à persister en BDD dans une version future).
     *
     * @param userId   UUID de l'utilisateur connecté
     * @param endpoint URL de l'endpoint push du navigateur
     * @param p256dh   Clé publique p256dh du navigateur
     * @param auth     Secret d'authentification du navigateur
     */
    void abonnerPush(UUID userId, String endpoint, String p256dh, String auth);
}