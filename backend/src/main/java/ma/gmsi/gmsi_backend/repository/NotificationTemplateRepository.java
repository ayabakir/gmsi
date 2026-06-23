// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/NotificationTemplateRepository.java

package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    // Recherche par code unique — utilisé par NotificationServiceImpl.envoyer()
    Optional<NotificationTemplate> findByCode(String code);

    // Vérification d'unicité avant création dans le DataLoader
    boolean existsByCode(String code);
}