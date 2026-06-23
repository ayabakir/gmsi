// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/controller/PreferenceNotifController.java

package ma.gmsi.gmsi_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.PreferenceNotifRequest;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import ma.gmsi.gmsi_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/preferences-notif")
@RequiredArgsConstructor
public class PreferenceNotifController {

    private final NotificationService notificationService;

    // PUT /api/user/preferences-notif
    @PutMapping
    public ResponseEntity<Void> mettreAJourPreference(
            @Valid @RequestBody PreferenceNotifRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.mettreAJourPreference(
                principal.getId(), request.preference());
        return ResponseEntity.ok().build();
    }
}