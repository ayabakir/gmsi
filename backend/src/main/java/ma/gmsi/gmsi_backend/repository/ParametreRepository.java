package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.Parametre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParametreRepository extends JpaRepository<Parametre, UUID> {
    Optional<Parametre> findByCle(String cle);
    boolean existsByCle(String cle);
}