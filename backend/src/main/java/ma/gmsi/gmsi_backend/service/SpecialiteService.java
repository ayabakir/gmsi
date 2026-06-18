package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.SpecialiteRequest;
import ma.gmsi.gmsi_backend.dto.response.SpecialiteResponse;

import java.util.List;
import java.util.UUID;

public interface SpecialiteService {

    SpecialiteResponse create(SpecialiteRequest request);

    List<SpecialiteResponse> findByTechnicien(UUID technicienId);

    void delete(UUID id);
}