package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/*
 * SANS SPRING (approche classique) :
 * - Interface DAO manuelle + implémentation JDBC
 * - PreparedStatement + ResultSet pour chaque requête
 * AVEC SPRING DATA JPA :
 * - JpaRepository fournit automatiquement : save, findById,
 *   findAll, delete... sans écrire une ligne de SQL
 */

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}