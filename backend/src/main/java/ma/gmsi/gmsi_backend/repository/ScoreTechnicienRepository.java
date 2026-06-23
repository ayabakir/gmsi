package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.ScoreTechnicien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreTechnicienRepository extends JpaRepository<ScoreTechnicien, UUID> {

    // Le score d'un technicien (relation OneToOne)
    Optional<ScoreTechnicien> findByTechnicienId(UUID technicienId);
}