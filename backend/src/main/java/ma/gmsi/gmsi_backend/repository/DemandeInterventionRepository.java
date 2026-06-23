package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.DemandeIntervention;
import ma.gmsi.gmsi_backend.entity.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DemandeInterventionRepository extends JpaRepository<DemandeIntervention, UUID> {

    // Les demandes d'un employé (pour qu'il suive les siennes)
    List<DemandeIntervention> findByEmployeIdOrderByDateCreationDesc(UUID employeId);

    // Toutes les demandes par statut (pour le responsable)
    List<DemandeIntervention> findByStatutOrderByDateCreationDesc(StatutDemande statut);

    // Toutes les demandes, les plus récentes d'abord
    List<DemandeIntervention> findAllByOrderByDateCreationDesc();

    // Pour générer la référence (compter les demandes existantes)
    long count();
}