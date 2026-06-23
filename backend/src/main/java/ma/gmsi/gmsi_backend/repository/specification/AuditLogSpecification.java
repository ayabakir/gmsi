// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/repository/specification/AuditLogSpecification.java
package ma.gmsi.gmsi_backend.repository.specification;

import jakarta.persistence.criteria.Predicate;
import ma.gmsi.gmsi_backend.entity.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Construit dynamiquement les critères de filtre pour l'audit log.
 * Tous les paramètres sont facultatifs : seuls ceux non-null sont
 * ajoutés à la requête finale.
 *
 * NB : AuditLog.utilisateur est une relation @ManyToOne vers Utilisateur
 * (pas un simple champ UUID idUtilisateur) — le filtre par utilisateur
 * navigue donc la relation via root.get("utilisateur").get("id").
 */
public final class AuditLogSpecification {

    private AuditLogSpecification() {
        // utilitaire, pas d'instanciation
    }

    public static Specification<AuditLog> avecFiltres(
            UUID idUtilisateur,
            String entiteType,
            LocalDateTime dateDebut,
            LocalDateTime dateFin) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (idUtilisateur != null) {
                predicates.add(criteriaBuilder.equal(root.get("utilisateur").get("id"), idUtilisateur));
            }

            if (entiteType != null && !entiteType.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("entiteType"), entiteType));
            }

            if (dateDebut != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dateAction"), dateDebut));
            }

            if (dateFin != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dateAction"), dateFin));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}