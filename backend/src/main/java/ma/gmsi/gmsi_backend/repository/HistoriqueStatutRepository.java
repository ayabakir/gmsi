package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.HistoriqueStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HistoriqueStatutRepository extends JpaRepository<HistoriqueStatut, UUID> {

    List<HistoriqueStatut> findByInterventionIdOrderByDateChangementAsc(UUID interventionId);
}