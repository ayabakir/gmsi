package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.AssignationTechnicien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignationTechnicienRepository extends JpaRepository<AssignationTechnicien, UUID> {

    // L'affectation d'une intervention (un seul technicien dans notre cas)
    Optional<AssignationTechnicien> findByInterventionId(UUID interventionId);

    // Les interventions assignées à un technicien
    List<AssignationTechnicien> findByTechnicienId(UUID technicienId);
}