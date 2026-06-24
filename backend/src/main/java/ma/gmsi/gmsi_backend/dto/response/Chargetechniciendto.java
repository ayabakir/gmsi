// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/dto/response/ChargeTechnicienDTO.java
package ma.gmsi.gmsi_backend.dto.response;

/**
 * Charge de travail d'un technicien : interventions EN_COURS + PLANIFIEE.
 * Alimenté depuis AssignationTechnicienRepository + InterventionRepository.
 */
public record ChargeTechnicienDTO(
        String nomComplet,
        Long nbInterventionsEnCours,
        Long nbInterventionsPlanifiees
) {}