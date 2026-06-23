// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/FicheConnaissanceService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.FicheConnaissanceRequest;
import ma.gmsi.gmsi_backend.dto.response.FicheConnaissanceResponse;

import java.util.List;
import java.util.UUID;

public interface FicheConnaissanceService {

    /**
     * Crée automatiquement une fiche de connaissance à partir d'un
     * rapport technique validé. Appelée par le module Rapport et Clôture
     * lorsqu'un RapportTechnique est marqué comme validé.
     *
     * Extrait automatiquement : la cause de la panne (causePanne du
     * rapport) devient la solution, le type de panne est déduit de
     * la catégorie de l'équipement concerné par l'intervention.
     * Si une fiche existe déjà pour ce rapport (appel en double),
     * retourne la fiche existante sans en créer une nouvelle.
     *
     * @param rapportId UUID du RapportTechnique source
     * @return la fiche de connaissance créée (ou existante si déjà créée)
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException
     *         si le rapport n'existe pas
     */
    FicheConnaissanceResponse creerDepuisRapport(UUID rapportId);

    /**
     * Création manuelle par un administrateur.
     *
     * @param request données de la fiche à créer
     * @return la fiche créée
     */
    FicheConnaissanceResponse creerManuelle(FicheConnaissanceRequest request);

    /**
     * Recherche de fiches avec filtres optionnels (catégorie et/ou mot-clé).
     *
     * @param categorieId filtre par catégorie (null = toutes)
     * @param motCle      filtre sur typePanne, solution et motsCles (null = aucun filtre)
     * @return liste des fiches correspondantes
     */
    List<FicheConnaissanceResponse> rechercher(UUID categorieId, String motCle);

    /**
     * Récupère une fiche par son identifiant.
     *
     * @param id identifiant UUID de la fiche
     * @return la fiche trouvée
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException si absente
     */
    FicheConnaissanceResponse getById(UUID id);

    /**
     * Retourne toutes les fiches de la base de connaissances.
     */
    List<FicheConnaissanceResponse> listerToutes();

    /**
     * Supprime une fiche par son identifiant.
     *
     * @param id identifiant UUID de la fiche à supprimer
     * @throws ma.gmsi.gmsi_backend.exception.ResourceNotFoundException si absente
     */
    void supprimer(UUID id);
}