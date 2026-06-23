// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/config/DataLoader.java

package ma.gmsi.gmsi_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.gmsi.gmsi_backend.entity.NotificationTemplate;
import ma.gmsi.gmsi_backend.entity.Parametre;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.PreferenceNotif;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.entity.enums.TypeNotification;
import ma.gmsi.gmsi_backend.repository.NotificationTemplateRepository;
import ma.gmsi.gmsi_backend.repository.ParametreRepository;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialise les données obligatoires au premier démarrage :
 *   - un compte ADMIN par défaut
 *   - les 5 paramètres système (coefficients de scoring + anonymat évaluation)
 *   - les 11 templates de notification (8 standard + 3 responsable)
 *
 * Idempotent : ne recrée que ce qui n'existe pas déjà.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private static final String ADMIN_EMAIL    = "admin@gmsi.ma";
    private static final String ADMIN_PASSWORD = "Admin@2026";

    private final UserRepository                 userRepository;
    private final ParametreRepository            parametreRepository;
    private final PasswordEncoder                passwordEncoder;
    private final NotificationTemplateRepository templateRepository;

    @Override
    public void run(String... args) {
        log.info("=== DataLoader : vérification des données initiales ===");
        initAdmin();
        initParametres();
        initTemplates();
        log.info("=== DataLoader : terminé ===");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    private void initAdmin() {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Admin déjà présent : {}", ADMIN_EMAIL);
            return;
        }
        Utilisateur admin = Utilisateur.builder()
                .nom("Admin")
                .prenom("Systeme")
                .email(ADMIN_EMAIL)
                .motDePasse(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(Role.ADMIN)
                .actif(true)
                .preferenceNotif(PreferenceNotif.EMAIL)
                .build();
        userRepository.save(admin);
        log.warn("[!] Admin créé : {} / {} — À MODIFIER après première connexion",
                ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PARAMÈTRES SYSTÈME
    // ─────────────────────────────────────────────────────────────────────────

    private void initParametres() {
        creerSiAbsent("COEFF_FACILE",        "1.0",  "Coefficient de difficulté FACILE (scoring techniciens)");
        creerSiAbsent("COEFF_MOYEN",         "1.5",  "Coefficient de difficulté MOYEN (scoring techniciens)");
        creerSiAbsent("COEFF_DIFFICILE",     "2.0",  "Coefficient de difficulté DIFFICILE (scoring techniciens)");
        creerSiAbsent("COEFF_CRITIQUE",      "3.0",  "Coefficient de difficulté CRITIQUE (scoring techniciens)");
        creerSiAbsent("ANONYMAT_EVALUATION", "true", "Si true, les techniciens ne voient pas l'auteur des évaluations");
    }

    private void creerSiAbsent(String cle, String valeur, String description) {
        if (parametreRepository.existsByCle(cle)) return;
        parametreRepository.save(Parametre.builder()
                .cle(cle).valeur(valeur).description(description)
                .build());
        log.info("[+] Paramètre créé : {} = {}", cle, valeur);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATES DE NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initialise les 11 templates de notification.
     * Idempotent : ne recrée pas un template si son code existe déjà en BDD.
     *
     * 8 templates standard (employé / technicien) :
     *   DEMANDE_RECUE, DEMANDE_ASSIGNEE, DEMANDE_REJETEE, MISSION_AFFECTEE,
     *   FIN_INTERVENTION, EVALUATION_RECUE, SEUIL_STOCK_BAS, COMPTE_DESACTIVE
     *
     * 3 templates responsable (ajoutés à la demande d'Aya) :
     *   DEMANDE_A_TRAITER, INTERVENTION_DEMARREE, INTERVENTION_TERMINEE_RESP
     */
    private void initTemplates() {

        // ── Employé ──────────────────────────────────────────────────────────

        creerTemplateIfAbsent(
                "DEMANDE_RECUE",
                "Votre demande {refDemande} a été reçue",
                "Bonjour {prenomEmploye}, votre demande {refDemande} " +
                        "concernant {descEquipement} a bien été enregistrée.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "DEMANDE_ASSIGNEE",
                "Demande {refDemande} — Intervention planifiée",
                "Bonjour {prenomEmploye}, un technicien a été assigné " +
                        "à votre demande {refDemande}. " +
                        "Technicien : {nomTechnicien}. Date prévue : {datePlanifiee}.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "DEMANDE_REJETEE",
                "Demande {refDemande} — Non retenue",
                "Bonjour {prenomEmploye}, votre demande {refDemande} " +
                        "n'a pas pu être retenue. Motif : {motifRejet}.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "FIN_INTERVENTION",
                "Intervention {refIntervention} terminée",
                "Bonjour {prenomEmploye}, l'intervention sur votre " +
                        "équipement {nomEquipement} est terminée. " +
                        "Merci de valider la clôture.",
                TypeNotification.EMAIL
        );

        // ── Technicien ───────────────────────────────────────────────────────

        creerTemplateIfAbsent(
                "MISSION_AFFECTEE",
                "Nouvelle mission assignée — {refIntervention}",
                "Bonjour {prenomTechnicien}, une nouvelle intervention " +
                        "{refIntervention} vous a été assignée. " +
                        "Équipement : {nomEquipement}. Date : {datePlanifiee}.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "EVALUATION_RECUE",
                "Vous avez reçu une évaluation",
                "Bonjour {prenomTechnicien}, vous avez reçu une " +
                        "évaluation pour l'intervention {refIntervention}. " +
                        "Note : {note}/5.",
                TypeNotification.EMAIL
        );

        // ── Système / Admin ──────────────────────────────────────────────────

        creerTemplateIfAbsent(
                "SEUIL_STOCK_BAS",
                "⚠️ Alerte stock — {nomPiece}",
                "Attention, la pièce {nomPiece} (réf: {reference}) " +
                        "est en dessous du seuil d'alerte. " +
                        "Stock actuel : {stockActuel} | Seuil : {seuilAlerte}.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "COMPTE_DESACTIVE",
                "Votre compte GMSI a été désactivé",
                "Bonjour {prenomUtilisateur}, votre compte a été " +
                        "désactivé par un administrateur. " +
                        "Contactez le support pour plus d'informations.",
                TypeNotification.EMAIL
        );

        // ── Responsable — ajoutés à la demande d'Aya ────────────────────────

        creerTemplateIfAbsent(
                "DEMANDE_A_TRAITER",
                "Nouvelle demande à traiter — {refDemande}",
                "Bonjour, une nouvelle demande {refDemande} a été soumise " +
                        "par {prenomEmploye} concernant : {descEquipement}. " +
                        "Merci de la traiter dans les meilleurs délais.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "INTERVENTION_DEMARREE",
                "Intervention {refIntervention} démarrée",
                "Bonjour, le technicien {nomTechnicien} a démarré " +
                        "l'intervention {refIntervention}. " +
                        "Vous pouvez suivre l'avancement depuis votre tableau de bord.",
                TypeNotification.EMAIL
        );

        creerTemplateIfAbsent(
                "INTERVENTION_TERMINEE_RESP",
                "Intervention {refIntervention} terminée — à valider",
                "Bonjour, le technicien {nomTechnicien} a clôturé " +
                        "l'intervention {refIntervention}. " +
                        "Merci de valider la clôture depuis votre tableau de bord.",
                TypeNotification.EMAIL
        );

        log.info("[DataLoader] {} templates de notification initialisés.", 11);
    }

    /**
     * Crée un template uniquement s'il n'existe pas déjà (idempotence).
     */
    private void creerTemplateIfAbsent(String code, String sujet,
                                       String corps, TypeNotification type) {
        if (!templateRepository.existsByCode(code)) {
            NotificationTemplate template = new NotificationTemplate();
            template.setCode(code);
            template.setSujet(sujet);
            template.setCorps(corps);
            template.setType(type);
            templateRepository.save(template);
            log.debug("[DataLoader] Template créé : {}", code);
        }
    }
}