// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/PieceRechangeRepository.java

package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.PieceRechange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PieceRechangeRepository extends JpaRepository<PieceRechange, UUID> {

    Optional<PieceRechange> findByReference(String reference);

    boolean existsByReference(String reference);

    @Query("SELECT p FROM PieceRechange p WHERE p.stockDisponible <= p.seuilAlerte")
    List<PieceRechange> findPiecesSousSeuilAlerte();
}