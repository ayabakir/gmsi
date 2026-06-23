// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/client/ScoringRecalculClient.java
package ma.gmsi.gmsi_backend.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Client HTTP interne qui notifie le module Scoring d'Aya lorsqu'un
 * coefficient de difficulté change, pour qu'elle recalcule tous les
 * ScoreTechnicien existants.
 *
 * Appel non bloquant : si le service Scoring n'est pas encore implémenté
 * (404) ou indisponible (connexion refusée, timeout, etc.), l'opération
 * de modification du paramètre n'échoue pas — seul un warning est loggé.
 *
 * ⚠️ Dépend du Module A5 (Scoring) d'Aya : endpoint
 * POST /api/internal/scoring/recalculer-tous
 * Si cet endpoint n'existe pas encore côté Aya, ce client logguera un
 * warning 404 à chaque appel — c'est attendu et non bloquant.
 */
@Slf4j
@Component
public class ScoringRecalculClient {

    private static final String URL_RECALCUL_SCORING =
            "http://localhost:8080/api/internal/scoring/recalculer-tous";

    private final RestTemplate restTemplate;

    public ScoringRecalculClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Notifie le module Scoring qu'un coefficient a changé et qu'un
     * recalcul global des scores est nécessaire.
     * Ne propage jamais d'exception : la mise à jour du paramètre
     * ne doit jamais être bloquée par l'indisponibilité du module Scoring.
     */
    public void notifierRecalcul() {
        try {
            restTemplate.postForEntity(URL_RECALCUL_SCORING, null, Void.class);
            log.info("Recalcul scoring déclenché avec succès suite à modification de coefficient.");
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Endpoint de recalcul scoring introuvable (404) — "
                    + "le module A5 d'Aya n'est probablement pas encore implémenté. "
                    + "La modification du paramètre est tout de même validée.");
        } catch (Exception e) {
            log.warn("Échec de la notification de recalcul scoring : {}. "
                            + "La modification du paramètre est tout de même validée.",
                    e.getMessage());
        }
    }
}