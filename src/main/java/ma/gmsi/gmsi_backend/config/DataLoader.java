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

    @Override
    public void run(String... args) {
        log.info("=== DataLoader : vérification des données initiales ===");
        initAdmin();
        initParametres();
        log.info("=== DataLoader : terminé ===");
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
}