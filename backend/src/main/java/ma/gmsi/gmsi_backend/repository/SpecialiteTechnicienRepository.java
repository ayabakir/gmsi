package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.SpecialiteTechnicien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecialiteTechnicienRepository extends JpaRepository<SpecialiteTechnicien, UUID> {

    // Lister les spécialités d'un technicien donné
    List<SpecialiteTechnicien> findByTechnicienId(UUID technicienId);

    // Vérifier si le couple (technicien, catégorie) existe déjà (contrainte d'unicité)
    boolean existsByTechnicienIdAndCategorieId(UUID technicienId, UUID categorieId);
}