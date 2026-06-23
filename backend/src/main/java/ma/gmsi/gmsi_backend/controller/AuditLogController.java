// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/AuditLogController.java
package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.AuditLogResponse;
import ma.gmsi.gmsi_backend.service.AuditLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Controller REST pour la consultation de l'audit log.
 * Couverture CDC : A-US7 (Consulter l'audit log).
 * Accès réservé au rôle ADMIN.
 */
@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> rechercher(
            @RequestParam(required = false) UUID idUtilisateur,
            @RequestParam(required = false) String entiteType,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {

        List<AuditLogResponse> resultats = auditLogService.rechercher(
                idUtilisateur, entiteType, dateDebut, dateFin);

        return ResponseEntity.ok(resultats);
    }

    @GetMapping("/export-csv")
    public ResponseEntity<String> exporterCsv(
            @RequestParam(required = false) UUID idUtilisateur,
            @RequestParam(required = false) String entiteType,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {

        String csv = auditLogService.exporterCsv(idUtilisateur, entiteType, dateDebut, dateFin);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_log.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}