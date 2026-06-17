// src/main/java/ma/gmsi/gmsi_backend/repository/EquipementRepository.java
package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.Equipement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EquipementRepository extends JpaRepository<Equipement, UUID> {

    List<Equipement> findByLocalisationId(UUID localisationId);
}