package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.PieceUtilisee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PieceUtiliseeRepository extends JpaRepository<PieceUtilisee, UUID> {

    List<PieceUtilisee> findByRapportId(UUID rapportId);
}