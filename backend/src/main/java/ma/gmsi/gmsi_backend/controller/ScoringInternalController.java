package ma.gmsi.gmsi_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.service.ScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint interne appelé par le module Paramètres (Ikram) via ScoringRecalculClient
 * quand un coefficient de difficulté change, pour recalculer tous les scores.
 *
 * Pas de @PreAuthorize : c'est un appel interne serveur-à-serveur (localhost).
 */
@RestController
@RequestMapping("/api/internal/scoring")
@RequiredArgsConstructor
public class ScoringInternalController {

    private final ScoringService scoringService;

    @PostMapping("/recalculer-tous")
    public ResponseEntity<Void> recalculerTous() {
        scoringService.recalculerTous();
        return ResponseEntity.ok().build();
    }
}