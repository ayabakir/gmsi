package ma.gmsi.gmsi_backend.service.impl;

import lombok.extern.slf4j.Slf4j;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * ====================================================================
 * IMPLÉMENTATION TEMPORAIRE (STUB) — À SUPPRIMER
 * ====================================================================
 * Cette classe est un bouchon provisoire qui permet au backend de démarrer
 * tant que le vrai module Notifications (I3, Ikram) n'est pas livré.
 *
 * Elle se contente d'écrire dans les logs au lieu d'envoyer de vraies
 * notifications. Dès qu'Ikram fournit sa véritable implémentation de
 * NotificationService, CETTE CLASSE DOIT ÊTRE SUPPRIMÉE.
 *
 * TODO[A2-NOTIF]: supprimer ce stub quand le module I3 est livré.
 * ====================================================================
 */
@Service
@Primary
@Slf4j
public class NotificationServiceStub implements NotificationService {

    @Override
    public void notifierChangementEtat(UUID destinataireId, String entiteType, UUID entiteId,
                                       String ancienEtat, String nouvelEtat) {
        log.info("[STUB NOTIF] Changement état — destinataire={}, {} {} : {} -> {}",
                destinataireId, entiteType, entiteId, ancienEtat, nouvelEtat);
    }

    @Override
    public void envoyerNotification(UUID destinataireId, String titre, String message) {
        log.info("[STUB NOTIF] Notification — destinataire={}, titre='{}', message='{}'",
                destinataireId, titre, message);
    }

    @Override
    public List<NotificationDTO> consulterNonLues(UUID utilisateurId) {
        log.info("[STUB NOTIF] consulterNonLues — utilisateur={}", utilisateurId);
        return Collections.emptyList();
    }

    @Override
    public void marquerCommeLue(UUID notificationId) {
        log.info("[STUB NOTIF] marquerCommeLue — notification={}", notificationId);
    }
}