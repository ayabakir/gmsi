// src/main/java/ma/gmsi/gmsi_backend/service/MouvementStockService.java
package ma.gmsi.gmsi_backend.service;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des mouvements de stock (entrées et sorties de pièces).
 *
 * <p>Cette interface est exposée par le module Référentiels/Stock (Ikram) et
 * appelée par le module Interventions (Aya) chaque fois qu'une pièce est
 * utilisée ou réapprovisionnée lors d'une intervention de maintenance.</p>
 *
 * <p>L'implémentation concrète sera fournie ultérieurement dans le module
 * Stock ; en attendant, ce contrat permet à Aya de développer ses services
 * métier sans dépendre de l'implémentation finale (inversion de dépendance).</p>
 */
public interface MouvementStockService {

    /**
     * Enregistre une sortie de stock pour une pièce utilisée lors d'une intervention.
     *
     * @param pieceId        identifiant de la pièce sortie du stock
     * @param interventionId identifiant de l'intervention ayant consommé la pièce
     * @param quantite       quantité sortie (doit être positive)
     * @param utilisateurId  identifiant de l'utilisateur ayant déclenché la sortie
     * @throws IllegalArgumentException si la quantité demandée dépasse le stock disponible
     */
    void enregistrerSortie(UUID pieceId, UUID interventionId, int quantite, UUID utilisateurId);

    /**
     * Enregistre une entrée de stock (réapprovisionnement) pour une pièce.
     *
     * @param pieceId       identifiant de la pièce réapprovisionnée
     * @param quantite      quantité entrée (doit être positive)
     * @param utilisateurId identifiant de l'utilisateur ayant déclenché l'entrée
     */
    void enregistrerEntree(UUID pieceId, int quantite, UUID utilisateurId);

    /**
     * Retourne la quantité actuellement disponible en stock pour une pièce donnée.
     *
     * @param pieceId identifiant de la pièce
     * @return quantité disponible (0 si la pièce n'existe pas ou n'a jamais été stockée)
     */
    int consulterStockDisponible(UUID pieceId);

    /**
     * Liste l'historique des mouvements de stock pour une pièce donnée,
     * du plus récent au plus ancien.
     *
     * @param pieceId identifiant de la pièce
     * @return liste des mouvements (entrées et sorties) associés à la pièce
     */
    List<MouvementStockDTO> consulterHistorique(UUID pieceId);

    /**
     * Représentation simplifiée d'un mouvement de stock, utilisée comme
     * type de retour en attendant le DTO définitif du module Stock.
     */
    record MouvementStockDTO(
            UUID id,
            UUID pieceId,
            String typeMouvement, // "ENTREE" ou "SORTIE"
            int quantite,
            UUID utilisateurId,
            UUID interventionId
    ) {}
}