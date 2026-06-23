// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/NotificationTemplateController.java

package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.NotificationTemplateRequest;
import ma.gmsi.gmsi_backend.dto.response.NotificationTemplateResponse;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications/templates")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class NotificationTemplateController {

    private final NotificationService notificationService;

    // GET /api/admin/notifications/templates
    @GetMapping
    public ResponseEntity<List<NotificationTemplateResponse>> listerTemplates() {
        return ResponseEntity.ok(notificationService.listerTemplates());
    }

    // POST /api/admin/notifications/templates → 201
    @PostMapping
    @Auditable(action = "CREATION_TEMPLATE", entiteType = "NOTIFICATION_TEMPLATE") // ✅
    public ResponseEntity<NotificationTemplateResponse> creerTemplate(
            @Valid @RequestBody NotificationTemplateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(notificationService.creerTemplate(request));
    }
}