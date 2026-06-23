// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/RapportTechniqueRepository.java
package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.RapportTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RapportTechniqueRepository extends JpaRepository<RapportTechnique, UUID> {
}