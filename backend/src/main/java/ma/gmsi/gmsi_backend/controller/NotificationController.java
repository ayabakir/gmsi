// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/NotificationController.java

package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.response.NotifCountResponse;
import ma.gmsi.gmsi_backend.dto.response.NotificationResponse;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications/mes-notifications
    @GetMapping("/mes-notifications")
    public ResponseEntity<List<NotificationResponse>> getMesNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                notificationService.getMesNotifications(principal.getId()));
    }

    // GET /api/notifications/non-lues/count
    @GetMapping("/non-lues/count")
    public ResponseEntity<NotifCountResponse> getNonLues(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                notificationService.getNonLues(principal.getId()));
    }

    // PUT /api/notifications/{id}/lue
    @PutMapping("/{id}/lue")
    public ResponseEntity<NotificationResponse> marquerLue(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                notificationService.marquerLue(id, principal.getId()));
    }

    // PUT /api/notifications/tout-lire
    @PutMapping("/tout-lire")
    public ResponseEntity<Void> marquerToutesLues(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.marquerToutesLues(principal.getId());
        return ResponseEntity.ok().build();
    }

    // Endpoint temporaire — à supprimer après les tests
    @PostMapping("/test-envoi")
    public ResponseEntity<String> testEnvoi(
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, String> variables = Map.of(
                "prenomEmploye",  "Ikram",
                "refDemande",     "DEM-001",
                "descEquipement", "Climatiseur Salle Serveur"
        );
        notificationService.envoyer(
                principal.getId(), "DEMANDE_RECUE", variables);
        return ResponseEntity.ok("Notification envoyée (voir BDD et logs)");
    }
}