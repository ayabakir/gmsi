// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/MouvementStockService.java

package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.PieceRechangeRequest;
import ma.gmsi.gmsi_backend.dto.response.MouvementStockResponse;
import ma.gmsi.gmsi_backend.dto.response.PieceRechangeResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion du stock et des mouvements de pièces de rechange.
 * Module I2 — couvre R-US8.
 *
 * ⚠️ CONTRAT PARTAGÉ AVEC LE MODULE A4 (Rapport technique — Aya) :
 * la méthode {@link #creerSortie(UUID, int, String, UUID, UUID)} est appelée
 * par le module A4 à chaque création d'une PieceUtilisee, afin de
 * décrémenter automatiquement le stock disponible.
 */
public interface MouvementStockService {

    PieceRechangeResponse creerPiece(PieceRechangeRequest request);

    PieceRechangeResponse modifierPiece(UUID id, PieceRechangeRequest request);

    void supprimerPiece(UUID id);

    List<PieceRechangeResponse> listerPieces();

    PieceRechangeResponse getPiece(UUID id);

    List<PieceRechangeResponse> getPiecesSousSeuilAlerte();

    /**
     * Enregistre une entrée de stock (réapprovisionnement) pour une pièce
     * donnée et incrémente son stock disponible.
     *
     * @param pieceId  identifiant UUID de la pièce concernée
     * @param quantite quantité entrante (doit être &gt; 0)
     * @param motif    motif de l'entrée (optionnel)
     * @param userId   identifiant UUID de l'utilisateur à l'origine du mouvement
     * @return le mouvement de stock créé, sous forme de DTO de réponse
     */
    MouvementStockResponse creerEntree(UUID pieceId, int quantite, String motif, UUID userId);

    /**
     * Enregistre une sortie de stock pour une pièce donnée et décrémente
     * son stock disponible.
     *
     * ⚠️ MÉTHODE EXPOSÉE AU MODULE A4 (Aya) : appelée automatiquement à
     * chaque création d'une PieceUtilisee dans un rapport technique, afin
     * de répercuter la consommation de pièces sur le stock.
     *
     * RG07 — règle de gestion critique : si {@code stockDisponible - quantite < 0},
     * la méthode lève une {@code BadRequestException} avec le message
     * "Stock insuffisant". Aucune sortie partielle n'est effectuée :
     * soit le mouvement est créé en intégralité, soit il est rejeté.
     *
     * @param pieceId        identifiant UUID de la pièce concernée (doit exister,
     *                       sinon {@code ResourceNotFoundException})
     * @param quantite       quantité sortante demandée (doit être &gt; 0)
     * @param motif          motif de la sortie (ex : "Utilisée sur intervention X").
     *                       Si {@code interventionId} est fourni et que motif est vide,
     *                       l'implémentation peut générer un motif par défaut.
     * @param userId         identifiant UUID de l'utilisateur à l'origine du mouvement
     *                       (technicien, responsable, etc.)
     * @param interventionId identifiant UUID de l'intervention à l'origine de la
     *                       sortie (peut être {@code null} si la sortie n'est pas
     *                       liée à une intervention, ex : sortie manuelle depuis
     *                       l'écran Stock)
     * @return le mouvement de stock créé, sous forme de DTO de réponse
     * @throws ma.gmsi.gmsi_backend.exception.BadRequestException si le stock
     *         disponible est insuffisant pour couvrir la quantité demandée
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException si la
     *         pièce ou l'utilisateur n'existe pas
     */
    MouvementStockResponse creerSortie(UUID pieceId, int quantite, String motif, UUID userId, UUID interventionId);

    List<MouvementStockResponse> listerMouvements();

    List<MouvementStockResponse> getMouvementsByPiece(UUID pieceId);
}