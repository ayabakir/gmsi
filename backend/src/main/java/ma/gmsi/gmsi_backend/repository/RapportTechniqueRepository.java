package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.RapportTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RapportTechniqueRepository extends JpaRepository<RapportTechnique, UUID> {

    // Un rapport est lié à une seule intervention (OneToOne)
    Optional<RapportTechnique> findByInterventionId(UUID interventionId);

    boolean existsByInterventionId(UUID interventionId);
}