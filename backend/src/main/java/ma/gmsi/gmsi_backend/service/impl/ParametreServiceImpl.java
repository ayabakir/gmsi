// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/impl/ParametreServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.client.ScoringRecalculClient;
import ma.gmsi.gmsi_backend.dto.request.ParametreRequest;
import ma.gmsi.gmsi_backend.dto.response.ParametreResponse;
import ma.gmsi.gmsi_backend.entity.Parametre;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.ParametreRepository;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import ma.gmsi.gmsi_backend.service.ParametreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Implémentation du service de gestion des paramètres système.
 * Couverture CDC : A-US6.
 */
@Service
@RequiredArgsConstructor
public class ParametreServiceImpl implements ParametreService {

    private static final String PREFIXE_COEFFICIENT = "COEFF_";

    private final ParametreRepository parametreRepository;
    private final UserRepository userRepository;
    private final ScoringRecalculClient scoringRecalculClient;

    @Override
    @Transactional(readOnly = true)
    public List<ParametreResponse> listerTous() {
        return parametreRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ParametreResponse getByCle(String cle) {
        Parametre parametre = findParametreOrThrow(cle);
        return toResponse(parametre);
    }

    @Override
    @Auditable(action = "MODIFICATION_PARAMETRE", entiteType = "PARAMETRE")
    @Transactional
    public ParametreResponse modifier(String cle, ParametreRequest request, UUID userId) {
        Parametre parametre = findParametreOrThrow(cle);

        Utilisateur utilisateur = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur introuvable avec l'id : " + userId));

        parametre.setValeur(request.valeur());
        if (request.description() != null) {
            parametre.setDescription(request.description());
        }
        parametre.setDateModification(LocalDateTime.now());
        parametre.setModifiePar(utilisateur);

        Parametre sauvegarde = parametreRepository.save(parametre);

        // Notification non bloquante du module Scoring d'Aya si c'est un coefficient
        if (sauvegarde.getCle().startsWith(PREFIXE_COEFFICIENT)) {
            scoringRecalculClient.notifierRecalcul();
        }

        return toResponse(sauvegarde);
    }

    private Parametre findParametreOrThrow(String cle) {
        return parametreRepository.findByCle(cle)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Paramètre introuvable avec la clé : " + cle));
    }

    private ParametreResponse toResponse(Parametre parametre) {
        String emailModifiePar = parametre.getModifiePar() != null
                ? parametre.getModifiePar().getEmail()
                : null;

        return new ParametreResponse(
                parametre.getId(),
                parametre.getCle(),
                parametre.getValeur(),
                parametre.getDescription(),
                parametre.getDateModification(),
                emailModifiePar
        );
    }
}