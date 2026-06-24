// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/FicheConnaissanceRepository.java
package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.FicheConnaissance;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FicheConnaissanceRepository extends JpaRepository<FicheConnaissance, UUID> {

    @EntityGraph(attributePaths = {"motsCles", "categorie"})
    List<FicheConnaissance> findByCategorieId(UUID categorieId);

    @EntityGraph(attributePaths = {"motsCles", "categorie"})
    List<FicheConnaissance> findByTypePanneContainingIgnoreCase(String typePanne);

    @EntityGraph(attributePaths = {"motsCles", "categorie"})
    @Query("SELECT DISTINCT f FROM FicheConnaissance f JOIN f.motsCles mc " +
            "WHERE LOWER(mc) LIKE LOWER(CONCAT('%', :motCle, '%'))")
    List<FicheConnaissance> findByMotCle(@Param("motCle") String motCle);

    @EntityGraph(attributePaths = {"motsCles", "categorie"})
    @Query("SELECT DISTINCT f FROM FicheConnaissance f " +
            "LEFT JOIN f.motsCles mc " +
            "WHERE (:categorieId IS NULL OR f.categorie.id = :categorieId) " +
            "AND (:motCle IS NULL OR LOWER(mc) LIKE LOWER(CONCAT('%', :motCle, '%')) " +
            "     OR LOWER(f.typePanne) LIKE LOWER(CONCAT('%', :motCle, '%')) " +
            "     OR LOWER(f.solution) LIKE LOWER(CONCAT('%', :motCle, '%')))")
    List<FicheConnaissance> rechercherAvecFiltres(
            @Param("categorieId") UUID categorieId,
            @Param("motCle") String motCle);

    @EntityGraph(attributePaths = {"motsCles", "categorie"})
    Optional<FicheConnaissance> findById(UUID id);

    @EntityGraph(attributePaths = {"motsCles", "categorie"})
    List<FicheConnaissance> findAll();

    Optional<FicheConnaissance> findByRapportSourceId(UUID rapportId);
}