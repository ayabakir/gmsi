// src/main/java/ma/gmsi/gmsi_backend/repository/AuditLogRepository.java
package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}