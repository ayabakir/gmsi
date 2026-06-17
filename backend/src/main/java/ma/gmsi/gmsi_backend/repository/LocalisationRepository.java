// src/main/java/ma/gmsi/gmsi_backend/repository/LocalisationRepository.java
package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.Localisation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocalisationRepository extends JpaRepository<Localisation, UUID> {

    List<Localisation> findByParentIsNull();

    List<Localisation> findByParentId(UUID parentId);
}