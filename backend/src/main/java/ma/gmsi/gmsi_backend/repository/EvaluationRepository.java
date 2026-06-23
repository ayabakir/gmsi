package ma.gmsi.gmsi_backend.repository;

import ma.gmsi.gmsi_backend.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {

    // Toutes les évaluations d'un technicien (pour calculer son score)
    List<Evaluation> findByTechnicienId(UUID technicienId);

    // Vérifier qu'une intervention n'a pas déjà été évaluée par cet employé
    boolean existsByInterventionIdAndEmployeId(UUID interventionId, UUID employeId);

    // Les évaluations reçues par un technicien (pour affichage)
    List<Evaluation> findByTechnicienIdOrderByDateEvaluationDesc(UUID technicienId);
}