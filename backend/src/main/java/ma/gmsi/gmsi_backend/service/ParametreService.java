// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/ParametreService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.ParametreRequest;
import ma.gmsi.gmsi_backend.dto.response.ParametreResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des paramètres système.
 * Couverture CDC : A-US6 (Gérer les paramètres système).
 */
public interface ParametreService {

    /**
     * Liste tous les paramètres système existants.
     */
    List<ParametreResponse> listerTous();

    /**
     * Récupère un paramètre par sa clé unique.
     *
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException si la clé n'existe pas
     */
    ParametreResponse getByCle(String cle);

    /**
     * Modifie la valeur (et éventuellement la description) d'un paramètre existant.
     * Si la clé commence par "COEFF_", déclenche après sauvegarde un appel non
     * bloquant à ScoringRecalculClient pour notifier le module Scoring d'Aya.
     *
     * @param cle     clé du paramètre à modifier (immuable)
     * @param request nouvelle valeur + description optionnelle
     * @param userId  UUID de l'utilisateur connecté (ADMIN), pour modifiePar
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException si la clé n'existe pas
     */
    ParametreResponse modifier(String cle, ParametreRequest request, UUID userId);

}