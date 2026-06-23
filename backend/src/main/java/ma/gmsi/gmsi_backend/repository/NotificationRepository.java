// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/NotificationRepository.java

package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Toutes les notifications d'un utilisateur, tri anti-chronologique
    List<Notification> findByDestinataireIdOrderByDateEnvoiDesc(UUID userId);

    // Uniquement les non lues — pour le badge et le filtre
    List<Notification> findByDestinataireIdAndLuFalse(UUID userId);

    // Compte des non lues — pour le badge numérique dans le header
    long countByDestinataireIdAndLuFalse(UUID userId);
}