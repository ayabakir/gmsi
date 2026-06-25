package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.Intervention;
import ma.gmsi.gmsi_backend.entity.enums.StatutIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, UUID> {

    List<Intervention> findAllByOrderByReferenceDesc();

    List<Intervention> findByStatutOrderByReferenceDesc(StatutIntervention statut);

    // Vérifier qu'une demande n'a pas déjà une intervention (relation OneToOne)
    boolean existsByDemandeId(UUID demandeId);

    long count();

    // Retrouver l'intervention liée à une demande (relation OneToOne)
    Optional<Intervention> findByDemandeId(UUID demandeId);
}