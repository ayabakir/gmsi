package ma.gmsi.gmsi_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.gmsi.gmsi_backend.entity.Parametre;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.PreferenceNotif;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.repository.ParametreRepository;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ma.gmsi.gmsi_backend.entity.NotificationTemplate;
import ma.gmsi.gmsi_backend.entity.enums.TypeNotification;
import ma.gmsi.gmsi_backend.repository.NotificationTemplateRepository;

/**
 * Initialise les données obligatoires au premier démarrage :
 *   - un compte ADMIN par défaut
 *   - les 5 paramètres système (coefficients de scoring + anonymat évaluation)
 *
 * Idempotent : ne recrée que ce qui n'existe pas déjà.
 * Étendre ce loader uniquement avec des données strictement nécessaires
 * au fonctionnement initial. Les jeux de test métier vont dans les modules concernés.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@gmsi.ma";
    private static final String ADMIN_PASSWORD = "Admin@2026";

    private final UserRepository userRepository;
    private final ParametreRepository parametreRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationTemplateRepository templateRepository;

    @Override
    public void run(String... args) {
        log.info("=== DataLoader : vérification des données initiales ===");
        initAdmin();
        initParametres();
        log.info("=== DataLoader : terminé ===");
        initTemplates();
    }

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
        log.warn("[!] Admin cree : {} / {} - A MODIFIER apres premiere connexion", ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    private void initParametres() {
        creerSiAbsent("COEFF_FACILE",        "1.0",  "Coefficient de difficulte FACILE (scoring techniciens)");
        creerSiAbsent("COEFF_MOYEN",         "1.5",  "Coefficient de difficulte MOYEN (scoring techniciens)");
        creerSiAbsent("COEFF_DIFFICILE",     "2.0",  "Coefficient de difficulte DIFFICILE (scoring techniciens)");
        creerSiAbsent("COEFF_CRITIQUE",      "3.0",  "Coefficient de difficulte CRITIQUE (scoring techniciens)");
        creerSiAbsent("ANONYMAT_EVALUATION", "true", "Si true, les techniciens ne voient pas l'auteur des evaluations");
    }

    private void creerSiAbsent(String cle, String valeur, String description) {
        if (parametreRepository.existsByCle(cle)) return;
        parametreRepository.save(Parametre.builder()
                .cle(cle).valeur(valeur).description(description)
                .build());
        log.info("[+] Parametre cree : {} = {}", cle, valeur);
    }


    /**
     * Initialise les 8 templates de notification standard.
     * Idempotent : ne recrée pas un template si son code existe déjà en BDD.
     */
    private void initTemplates() {
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
                "MISSION_AFFECTEE",
                "Nouvelle mission assignée — {refIntervention}",
                "Bonjour {prenomTechnicien}, une nouvelle intervention " +
                        "{refIntervention} vous a été assignée. " +
                        "Équipement : {nomEquipement}. Date : {datePlanifiee}.",
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

        creerTemplateIfAbsent(
                "EVALUATION_RECUE",
                "Vous avez reçu une évaluation",
                "Bonjour {prenomTechnicien}, vous avez reçu une " +
                        "évaluation pour l'intervention {refIntervention}. " +
                        "Note : {note}/5.",
                TypeNotification.EMAIL
        );

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

        log.info("[DataLoader] Templates de notification initialisés.");
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