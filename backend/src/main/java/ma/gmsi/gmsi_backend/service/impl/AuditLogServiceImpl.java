// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/impl/AuditLogServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.AuditLogResponse;
import ma.gmsi.gmsi_backend.entity.AuditLog;
import ma.gmsi.gmsi_backend.repository.AuditLogRepository;
import ma.gmsi.gmsi_backend.repository.specification.AuditLogSpecification;
import ma.gmsi.gmsi_backend.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service de consultation de l'audit log.
 * Couverture CDC : A-US7 (Consulter l'audit log).
 *
 * Aucune méthode ici n'est annotée @Auditable : on n'audite pas la
 * consultation de l'audit lui-même (ça créerait une boucle de logs inutile).
 *
 * NB : AuditLog possède une relation @ManyToOne LAZY vers Utilisateur
 * (champ "utilisateur", pas un simple UUID "idUtilisateur"). On reste
 * donc en lecture dans une transaction (@Transactional readOnly) pour
 * pouvoir accéder à utilisateur.getEmail() sans LazyInitializationException.
 */
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> rechercher(UUID idUtilisateur, String entiteType,
                                             LocalDateTime dateDebut, LocalDateTime dateFin) {

        List<AuditLog> resultats = auditLogRepository.findAll(
                AuditLogSpecification.avecFiltres(idUtilisateur, entiteType, dateDebut, dateFin));

        return toResponseList(resultats);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> listerTous() {
        return toResponseList(auditLogRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public String exporterCsv(UUID idUtilisateur, String entiteType,
                              LocalDateTime dateDebut, LocalDateTime dateFin) {

        List<AuditLog> resultats = auditLogRepository.findAll(
                AuditLogSpecification.avecFiltres(idUtilisateur, entiteType, dateDebut, dateFin));

        StringBuilder csv = new StringBuilder();
        csv.append("Date;Utilisateur;Action;Type;IdEntite;Details\n");

        for (AuditLog log : resultats) {
            String email = log.getUtilisateur() != null ? log.getUtilisateur().getEmail() : "";

            csv.append(echapperCsv(log.getDateAction() != null ? log.getDateAction().toString() : ""))
                    .append(";")
                    .append(echapperCsv(email))
                    .append(";")
                    .append(echapperCsv(log.getAction()))
                    .append(";")
                    .append(echapperCsv(log.getEntiteType()))
                    .append(";")
                    .append(echapperCsv(log.getIdEntite() != null ? log.getIdEntite().toString() : ""))
                    .append(";")
                    .append(echapperCsv(log.getDetails()))
                    .append("\n");
        }

        return csv.toString();
    }

    /**
     * Convertit une liste d'AuditLog en AuditLogResponse, en résolvant
     * l'email directement depuis la relation JPA utilisateur (LAZY,
     * chargée à la demande dans la transaction readOnly courante).
     */
    private List<AuditLogResponse> toResponseList(List<AuditLog> logs) {
        return logs.stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getEntiteType(),
                        log.getIdEntite(),
                        log.getUtilisateur() != null ? log.getUtilisateur().getEmail() : null,
                        log.getDetails(),
                        log.getDateAction()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Échappe les valeurs pour le format CSV (point-virgule comme séparateur,
     * guillemets si la valeur contient un point-virgule, un saut de ligne ou
     * un guillemet).
     */
    private String echapperCsv(String valeur) {
        if (valeur == null) {
            return "";
        }
        if (valeur.contains(";") || valeur.contains("\n") || valeur.contains("\"")) {
            return "\"" + valeur.replace("\"", "\"\"") + "\"";
        }
        return valeur;
    }
}