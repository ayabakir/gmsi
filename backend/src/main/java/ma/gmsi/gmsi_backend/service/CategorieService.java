// src/main/java/ma/gmsi/gmsi_backend/service/CategorieService.java
package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.CategorieRequest;
import ma.gmsi.gmsi_backend.dto.response.CategorieResponse;

import java.util.List;
import java.util.UUID;

public interface CategorieService {

    CategorieResponse create(CategorieRequest request);

    List<CategorieResponse> findAll();

    CategorieResponse findById(UUID id);

    CategorieResponse update(UUID id, CategorieRequest request);

    void delete(UUID id);
}