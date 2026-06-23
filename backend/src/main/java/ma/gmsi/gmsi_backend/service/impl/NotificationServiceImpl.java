// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/impl/NotificationServiceImpl.java

package ma.gmsi.gmsi_backend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.gmsi.gmsi_backend.dto.request.NotificationTemplateRequest;
import ma.gmsi.gmsi_backend.dto.response.NotifCountResponse;
import ma.gmsi.gmsi_backend.dto.response.NotificationResponse;
import ma.gmsi.gmsi_backend.dto.response.NotificationTemplateResponse;
import ma.gmsi.gmsi_backend.entity.Notification;
import ma.gmsi.gmsi_backend.entity.NotificationTemplate;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.PreferenceNotif;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.NotificationRepository;
import ma.gmsi.gmsi_backend.repository.NotificationTemplateRepository;
import ma.gmsi.gmsi_backend.repository.UserRepository;          // ✅ nom réel
import ma.gmsi.gmsi_backend.service.NotificationService;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    private final UserRepository userRepository;               // ✅ corrigé
    private final JavaMailSender mailSender;

    @Value("${gmsi.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${gmsi.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${gmsi.vapid.subject:mailto:admin@gmsi.ma}")
    private String vapidSubject;

    // Stockage en mémoire des abonnements push (clé = userId)
    private final Map<UUID, Subscription> pushSubscriptions = new ConcurrentHashMap<>();

    // ─────────────────────────────────────────────────────────────────────────
    // MÉTHODE CENTRALE — CONTRAT AVEC AYA
    // ⚠️ Ne jamais propager d'exception depuis cette méthode
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void envoyer(UUID destinataireId, String codeTemplate, Map<String, String> variables) {
        try {
            // a. Récupérer le destinataire
            Utilisateur destinataire = userRepository.findById(destinataireId)  // ✅
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Utilisateur destinataire introuvable : " + destinataireId));

            // b. Récupérer le template par son code
            NotificationTemplate template = templateRepository.findByCode(codeTemplate)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Template de notification introuvable : " + codeTemplate));

            // c. Substituer les variables dans le corps et le sujet
            String corps = substituerVariables(template.getCorps(), variables);
            String sujet = substituerVariables(template.getSujet(), variables);

            // d. Persister la notification en base (historique garanti)
            Notification notification = new Notification();
            notification.setType(template.getType());
            notification.setMessage(corps);
            notification.setLu(false);
            notification.setDateEnvoi(LocalDateTime.now());
            notification.setDestinataire(destinataire);
            notificationRepository.save(notification);

            // e. Envoi selon la préférence du destinataire
            PreferenceNotif pref = destinataire.getPreferenceNotif();

            if (pref == PreferenceNotif.EMAIL || pref == PreferenceNotif.LES_DEUX) {
                envoyerEmail(destinataire, sujet, corps);
            }
            if (pref == PreferenceNotif.PUSH || pref == PreferenceNotif.LES_DEUX) {
                envoyerPush(destinataire, corps);
            }

        } catch (Exception e) {
            log.warn("[NotificationService] Échec envoi notification à {} avec template '{}' : {}",
                    destinataireId, codeTemplate, e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONSULTATION
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMesNotifications(UUID userId) {
        return notificationRepository
                .findByDestinataireIdOrderByDateEnvoiDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NotifCountResponse getNonLues(UUID userId) {
        long count = notificationRepository.countByDestinataireIdAndLuFalse(userId);
        return new NotifCountResponse(count);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARQUAGE LU / NON LU
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public NotificationResponse marquerLue(UUID notifId, UUID userId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification introuvable : " + notifId));

        if (!notif.getDestinataire().getId().equals(userId)) {
            throw new BadRequestException("Cette notification ne vous appartient pas.");
        }

        notif.setLu(true);
        return toResponse(notificationRepository.save(notif));
    }

    @Override
    @Transactional
    public void marquerToutesLues(UUID userId) {
        List<Notification> nonLues = notificationRepository
                .findByDestinataireIdAndLuFalse(userId);
        nonLues.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(nonLues);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATES (ADMIN)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public NotificationTemplateResponse creerTemplate(NotificationTemplateRequest req) {
        if (templateRepository.existsByCode(req.code())) {
            throw new BadRequestException(
                    "Un template avec le code '" + req.code() + "' existe déjà.");
        }

        NotificationTemplate template = new NotificationTemplate();
        template.setCode(req.code());
        template.setSujet(req.sujet());
        template.setCorps(req.corps());
        template.setType(req.type());

        return toTemplateResponse(templateRepository.save(template));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> listerTemplates() {
        return templateRepository.findAll()
                .stream()
                .map(this::toTemplateResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRÉFÉRENCES & PUSH
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void mettreAJourPreference(UUID userId, PreferenceNotif preference) {
        Utilisateur user = userRepository.findById(userId)            // ✅
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur introuvable : " + userId));
        user.setPreferenceNotif(preference);
        userRepository.save(user);                                    // ✅
    }

    @Override
    public void abonnerPush(UUID userId, String endpoint, String p256dh, String auth) {
        Subscription subscription = new Subscription(
                endpoint, new Subscription.Keys(p256dh, auth));
        pushSubscriptions.put(userId, subscription);
        log.info("[NotificationService] Abonnement Push enregistré pour {}", userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MÉTHODES PRIVÉES — ENVOI
    // ─────────────────────────────────────────────────────────────────────────

    private void envoyerEmail(Utilisateur destinataire, String sujet, String corps) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(destinataire.getEmail());
            helper.setSubject(sujet);
            helper.setText(corps, true); // HTML
            mailSender.send(message);
            log.debug("[NotificationService] Email envoyé à {}", destinataire.getEmail());
        } catch (MessagingException e) {
            log.warn("[NotificationService] Échec email à {} : {}",
                    destinataire.getEmail(), e.getMessage());
        } catch (Exception e) {
            log.warn("[NotificationService] Erreur inattendue email à {} : {}",
                    destinataire.getEmail(), e.getMessage());
        }
    }

    private void envoyerPush(Utilisateur destinataire, String corps) {
        try {
            if (vapidPublicKey == null || vapidPublicKey.isBlank()
                    || vapidPrivateKey == null || vapidPrivateKey.isBlank()) {
                log.warn("[NotificationService] Clés VAPID non configurées — Push ignoré.");
                return;
            }

            Subscription subscription = pushSubscriptions.get(destinataire.getId());
            if (subscription == null) {
                log.debug("[NotificationService] Pas d'abonnement Push pour {}",
                        destinataire.getId());
                return;
            }

            PushService pushService = new PushService(
                    vapidPublicKey, vapidPrivateKey, vapidSubject);

            nl.martijndwars.webpush.Notification pushNotif =
                    new nl.martijndwars.webpush.Notification(subscription, corps); // ✅ String

            pushService.send(pushNotif);
            log.debug("[NotificationService] Push envoyé à {}", destinataire.getId());

        } catch (Exception e) {
            log.warn("[NotificationService] Échec Push à {} : {}",
                    destinataire.getId(), e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITAIRES
    // ─────────────────────────────────────────────────────────────────────────

    private String substituerVariables(String texte, Map<String, String> variables) {
        if (texte == null) return "";
        if (variables == null || variables.isEmpty()) return texte;
        String resultat = texte;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            resultat = resultat.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return resultat;
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getMessage(),
                n.isLu(),
                n.getDateEnvoi(),
                n.getDestinataire().getEmail(),
                n.getIntervention() != null ? n.getIntervention().getId() : null
        );
    }

    private NotificationTemplateResponse toTemplateResponse(NotificationTemplate t) {
        return new NotificationTemplateResponse(
                t.getId(),
                t.getCode(),
                t.getSujet(),
                t.getCorps(),
                t.getType()
        );
    }
}