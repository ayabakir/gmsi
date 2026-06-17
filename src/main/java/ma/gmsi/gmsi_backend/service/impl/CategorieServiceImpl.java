// src/main/java/ma/gmsi/gmsi_backend/service/impl/CategorieServiceImpl.java
package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.CategorieRequest;
import ma.gmsi.gmsi_backend.dto.response.CategorieResponse;
import ma.gmsi.gmsi_backend.entity.Categorie;
import ma.gmsi.gmsi_backend.repository.CategorieRepository;
import ma.gmsi.gmsi_backend.service.CategorieService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategorieServiceImpl implements CategorieService {

    private final CategorieRepository categorieRepository;

    @Override
    public CategorieResponse create(CategorieRequest request) {
        Categorie categorie = Categorie.builder()
                .libelle(request.getLibelle())
                .description(request.getDescription())
                .build();

        Categorie saved = categorieRepository.save(categorie);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategorieResponse> findAll() {
        return categorieRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategorieResponse findById(UUID id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ma.gmsi.gmsi_backend.exception.ResourceNotFoundException(
                        "Catégorie introuvable avec l'id : " + id));
        return toResponse(categorie);
    }

    @Override
    public CategorieResponse update(UUID id, CategorieRequest request) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ma.gmsi.gmsi_backend.exception.ResourceNotFoundException(
                        "Catégorie introuvable avec l'id : " + id));

        categorie.setLibelle(request.getLibelle());
        categorie.setDescription(request.getDescription());

        Categorie updated = categorieRepository.save(categorie);
        return toResponse(updated);
    }

    @Override
    public void delete(UUID id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ma.gmsi.gmsi_backend.exception.ResourceNotFoundException(
                        "Catégorie introuvable avec l'id : " + id));
        categorieRepository.delete(categorie);
    }

    private CategorieResponse toResponse(Categorie categorie) {
        return CategorieResponse.builder()
                .id(categorie.getId())
                .libelle(categorie.getLibelle())
                .description(categorie.getDescription())
                .build();
    }
}