// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/AuditLogRepository.java
package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository pour la consultation de l'audit log.
 * Couverture CDC : A-US7 (Consulter l'audit log).
 *
 * JpaSpecificationExecutor ajouté pour permettre le filtre dynamique
 * combiné (utilisateur + type + période, tous facultatifs) via
 * AuditLogSpecification.
 *
 * NB : AuditLog.utilisateur est une relation @ManyToOne vers Utilisateur,
 * pas un simple champ UUID. La méthode dérivée doit donc naviguer la
 * relation : findByUtilisateurId (et non findByIdUtilisateur, qui ne
 * correspond à aucun champ de l'entité).
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID>,
        JpaSpecificationExecutor<AuditLog> {

    List<AuditLog> findByUtilisateurId(UUID idUtilisateur);

    List<AuditLog> findByEntiteType(String entiteType);

    List<AuditLog> findByDateActionBetween(LocalDateTime debut, LocalDateTime fin);

}