// src/main/java/ma/gmsi/gmsi_backend/service/LocalisationService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.LocalisationRequest;
import ma.gmsi.gmsi_backend.dto.response.LocalisationResponse;

import java.util.List;
import java.util.UUID;

public interface LocalisationService {

    LocalisationResponse create(LocalisationRequest request);

    List<LocalisationResponse> findAll();

    LocalisationResponse findById(UUID id);

    LocalisationResponse update(UUID id, LocalisationRequest request);

    void delete(UUID id);

    List<LocalisationResponse> findRacines();

    List<LocalisationResponse> findEnfants(UUID id);
}