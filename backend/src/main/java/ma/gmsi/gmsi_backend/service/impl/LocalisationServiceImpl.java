// src/main/java/ma/gmsi/gmsi_backend/service/impl/LocalisationServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.LocalisationRequest;
import ma.gmsi.gmsi_backend.dto.response.LocalisationResponse;
import ma.gmsi.gmsi_backend.entity.Localisation;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.LocalisationRepository;
import ma.gmsi.gmsi_backend.service.LocalisationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LocalisationServiceImpl implements LocalisationService {

    private final LocalisationRepository localisationRepository;

    @Override
    public LocalisationResponse create(LocalisationRequest request) {
        Localisation parent = resolveParent(null, request.getParentId());

        Localisation localisation = Localisation.builder()
                .libelle(request.getLibelle())
                .type(request.getType())
                .parent(parent)
                .build();

        Localisation saved = localisationRepository.save(localisation);
        return toResponse(saved, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalisationResponse> findAll() {
        return localisationRepository.findAll()
                .stream()
                .map(loc -> toResponse(loc, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LocalisationResponse findById(UUID id) {
        Localisation localisation = getOrThrow(id);
        return toResponse(localisation, false);
    }

    @Override
    public LocalisationResponse update(UUID id, LocalisationRequest request) {
        Localisation localisation = getOrThrow(id);

        Localisation parent = resolveParent(id, request.getParentId());

        localisation.setLibelle(request.getLibelle());
        localisation.setType(request.getType());
        localisation.setParent(parent);

        Localisation updated = localisationRepository.save(localisation);
        return toResponse(updated, false);
    }

    @Override
    public void delete(UUID id) {
        Localisation localisation = getOrThrow(id);

        List<Localisation> enfants = localisationRepository.findByParentId(id);
        if (!enfants.isEmpty()) {
            throw new BadRequestException(
                    "Impossible de supprimer cette localisation : elle possède des sous-éléments.");
        }

        localisationRepository.delete(localisation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalisationResponse> findRacines() {
        return localisationRepository.findByParentIsNull()
                .stream()
                .map(loc -> toResponse(loc, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalisationResponse> findEnfants(UUID id) {
        // Vérifie que le parent existe (404 sinon)
        getOrThrow(id);

        return localisationRepository.findByParentId(id)
                .stream()
                .map(loc -> toResponse(loc, false))
                .collect(Collectors.toList());
    }

    // ----------------- Helpers -----------------

    private Localisation getOrThrow(UUID id) {
        return localisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Localisation introuvable avec l'id : " + id));
    }

    /**
     * Résout le parent à partir de parentId, avec règles métier :
     * - parentId null => pas de parent (racine)
     * - le parent doit exister (404)
     * - une localisation ne peut pas être son propre parent (400)
     */
    private Localisation resolveParent(UUID currentId, UUID parentId) {
        if (parentId == null) {
            return null;
        }

        if (currentId != null && currentId.equals(parentId)) {
            throw new BadRequestException("Une localisation ne peut pas être son propre parent.");
        }

        return localisationRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Localisation parente introuvable avec l'id : " + parentId));
    }

    private LocalisationResponse toResponse(Localisation localisation, boolean withEnfants) {
        LocalisationResponse.LocalisationResponseBuilder builder = LocalisationResponse.builder()
                .id(localisation.getId())
                .libelle(localisation.getLibelle())
                .type(localisation.getType())
                .description(localisation.getDescription())
                .cheminComplet(buildChemin(localisation));

        if (localisation.getParent() != null) {
            builder.parentId(localisation.getParent().getId());
            builder.parentLibelle(localisation.getParent().getLibelle());
        }

        if (withEnfants) {
            List<LocalisationResponse> enfants = localisationRepository
                    .findByParentId(localisation.getId())
                    .stream()
                    .map(child -> toResponse(child, true))
                    .collect(Collectors.toList());
            builder.enfants(enfants);
        }

        return builder.build();
    }

    private String buildChemin(Localisation loc) {
        if (loc.getParent() == null) {
            return loc.getLibelle();
        }
        return buildChemin(loc.getParent()) + " → " + loc.getLibelle();
    }
}