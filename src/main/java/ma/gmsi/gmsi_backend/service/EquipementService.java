// src/main/java/ma/gmsi/gmsi_backend/service/EquipementService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.EquipementRequest;
import ma.gmsi.gmsi_backend.dto.response.EquipementResponse;

import java.util.List;
import java.util.UUID;

public interface EquipementService {

    EquipementResponse create(EquipementRequest request);

    List<EquipementResponse> findAll();

    EquipementResponse findById(UUID id);

    EquipementResponse update(UUID id, EquipementRequest request);

    void delete(UUID id);

    List<EquipementResponse> findByLocalisation(UUID localisationId);
}