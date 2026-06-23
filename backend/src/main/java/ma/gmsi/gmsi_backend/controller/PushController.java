// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/PushController.java

package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.PushSubscriptionRequest;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushController {

    private final NotificationService notificationService;

    // POST /api/push/subscribe
    @PostMapping("/subscribe")
    public ResponseEntity<Void> abonnerPush(
            @Valid @RequestBody PushSubscriptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.abonnerPush(
                principal.getId(),
                request.endpoint(),
                request.p256dh(),
                request.auth()
        );
        return ResponseEntity.ok().build();
    }
}