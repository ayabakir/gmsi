// src/main/java/ma/gmsi/gmsi_backend/service/impl/EquipementServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.EquipementRequest;
import ma.gmsi.gmsi_backend.dto.response.EquipementResponse;
import ma.gmsi.gmsi_backend.entity.Equipement;
import ma.gmsi.gmsi_backend.entity.Localisation;
import ma.gmsi.gmsi_backend.entity.enums.StatutEquipement;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.EquipementRepository;
import ma.gmsi.gmsi_backend.repository.LocalisationRepository;
import ma.gmsi.gmsi_backend.service.EquipementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipementServiceImpl implements EquipementService {

    private final EquipementRepository equipementRepository;
    private final LocalisationRepository localisationRepository;


    @Override
    public EquipementResponse create(EquipementRequest request) {
        Localisation localisation = getLocalisationOrThrow(request.getLocalisationId());

        Equipement equipement = Equipement.builder()
                .reference(request.getReference())
                .nom(request.getNom())
                .type(request.getType())
                .statut(request.getStatut() != null ? request.getStatut() : StatutEquipement.OPERATIONNEL)
                .description(request.getDescription())
                .localisation(localisation)
                .dateMiseEnService(request.getDateMiseEnService())
                .build();

        return toResponse(equipementRepository.save(equipement));
    }

    @Override
    public EquipementResponse update(UUID id, EquipementRequest request) {
        Equipement equipement = getOrThrow(id);
        Localisation localisation = getLocalisationOrThrow(request.getLocalisationId());

        equipement.setReference(request.getReference());
        equipement.setNom(request.getNom());
        equipement.setType(request.getType());
        if (request.getStatut() != null) equipement.setStatut(request.getStatut());
        equipement.setDescription(request.getDescription());
        equipement.setLocalisation(localisation);
        equipement.setDateMiseEnService(request.getDateMiseEnService());

        return toResponse(equipementRepository.save(equipement));
    }

    private EquipementResponse toResponse(Equipement equipement) {
        return EquipementResponse.builder()
                .id(equipement.getId())
                .reference(equipement.getReference())
                .nom(equipement.getNom())
                .type(equipement.getType())
                .statut(equipement.getStatut())
                .description(equipement.getDescription())
                .localisationId(equipement.getLocalisation().getId())
                .localisationLibelle(equipement.getLocalisation().getLibelle())
                .dateMiseEnService(equipement.getDateMiseEnService())
                .dateCreation(equipement.getDateCreation())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> findAll() {
        return equipementRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EquipementResponse findById(UUID id) {
        return toResponse(getOrThrow(id));
    }



    @Override
    public void delete(UUID id) {
        Equipement equipement = getOrThrow(id);
        equipementRepository.delete(equipement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipementResponse> findByLocalisation(UUID localisationId) {
        // Vérifie que la localisation existe (404 sinon)
        getLocalisationOrThrow(localisationId);

        return equipementRepository.findByLocalisationId(localisationId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ----------------- Helpers -----------------

    private Equipement getOrThrow(UUID id) {
        return equipementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Équipement introuvable avec l'id : " + id));
    }

    private Localisation getLocalisationOrThrow(UUID id) {
        return localisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Localisation introuvable avec l'id : " + id));
    }


}