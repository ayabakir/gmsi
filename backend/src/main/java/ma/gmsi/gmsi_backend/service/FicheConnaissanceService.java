// src/main/java/ma/gmsi/gmsi_backend/service/FicheConnaissanceService.java
package ma.gmsi.gmsi_backend.service;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des fiches de connaissance générées à partir des
 * rapports d'intervention validés.
 *
 * <p>Exposé par le module Fiches de connaissance (Ikram), appelé par le
 * module Interventions/Rapports (Aya) chaque fois qu'un responsable valide
 * un rapport d'intervention, afin de capitaliser le savoir technique associé.</p>
 */
public interface FicheConnaissanceService {

    /**
     * Crée une fiche de connaissance à partir d'un rapport d'intervention
     * qui vient d'être validé.
     *
     * @param rapportId    identifiant du rapport d'intervention validé
     * @param validateurId identifiant de l'utilisateur ayant validé le rapport
     * @return identifiant de la fiche de connaissance créée
     */
    UUID creerDepuisRapport(UUID rapportId, UUID validateurId);

    /**
     * Recherche les fiches de connaissance liées à un équipement, utile pour
     * proposer des solutions déjà documentées lors d'une nouvelle intervention.
     *
     * @param equipementId identifiant de l'équipement concerné
     * @return liste des fiches de connaissance correspondantes
     */
    List<FicheConnaissanceDTO> rechercherParEquipement(UUID equipementId);

    /**
     * Consulte le détail d'une fiche de connaissance.
     *
     * @param ficheId identifiant de la fiche de connaissance
     * @return détail de la fiche, ou null si elle n'existe pas
     */
    FicheConnaissanceDTO consulter(UUID ficheId);

    /**
     * Représentation simplifiée d'une fiche de connaissance, utilisée comme
     * type de retour en attendant le DTO définitif du module Fiches.
     */
    record FicheConnaissanceDTO(
            UUID id,
            UUID rapportId,
            UUID equipementId,
            String titre,
            String contenu,
            UUID auteurId
    ) {}
}