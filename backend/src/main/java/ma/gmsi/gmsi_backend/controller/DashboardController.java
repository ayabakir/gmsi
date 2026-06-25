// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/DashboardController.java
package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.DashboardAdminResponse;
import ma.gmsi.gmsi_backend.dto.response.DashboardResponsableResponse;
import ma.gmsi.gmsi_backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller du Module I6 — Dashboard et KPIs.
 * Base URL : /api/dashboard
 *
 * Endpoints :
 *   GET /api/dashboard/responsable/kpis  → RESPONSABLE + ADMIN
 *   GET /api/dashboard/admin/kpis        → ADMIN uniquement
 *
 * Pas de @Auditable (consultation pure).
 * CORS géré globalement par la config existante.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Dashboard métier — KPIs pour le RESPONSABLE.
     * Accessible aussi par l'ADMIN pour qu'il puisse voir la vue métier.
     */
    @GetMapping("/responsable/kpis")
    @PreAuthorize("hasRole('RESPONSABLE') or hasRole('ADMIN')")
    public ResponseEntity<DashboardResponsableResponse> getDashboardResponsable() {
        return ResponseEntity.ok(dashboardService.getDashboardResponsable());
    }

    /**
     * Dashboard système — KPIs globaux pour l'ADMIN uniquement.
     */
    @GetMapping("/admin/kpis")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardAdminResponse> getDashboardAdmin() {
        return ResponseEntity.ok(dashboardService.getDashboardAdmin());
    }
}