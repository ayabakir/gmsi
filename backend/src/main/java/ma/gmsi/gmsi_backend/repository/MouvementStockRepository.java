// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/MouvementStockRepository.java

package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.MouvementStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MouvementStockRepository extends JpaRepository<MouvementStock, UUID> {

    List<MouvementStock> findByPiece_Id(UUID pieceId);

    List<MouvementStock> findAllByOrderByDateMouvementDesc();

    boolean existsByPiece_Id(UUID pieceId);
}