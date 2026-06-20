package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.dto.request.SpecialiteRequest;
import ma.gmsi.gmsi_backend.dto.response.SpecialiteResponse;
import ma.gmsi.gmsi_backend.entity.Categorie;
import ma.gmsi.gmsi_backend.entity.SpecialiteTechnicien;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.NiveauSpecialite;
import ma.gmsi.gmsi_backend.entity.enums.Role;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.CategorieRepository;
import ma.gmsi.gmsi_backend.repository.SpecialiteTechnicienRepository;
import ma.gmsi.gmsi_backend.repository.UserRepository;
import ma.gmsi.gmsi_backend.service.SpecialiteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SpecialiteServiceImpl implements SpecialiteService {

    private final SpecialiteTechnicienRepository specialiteRepository;
    private final UserRepository userRepository;
    private final CategorieRepository categorieRepository;

    @Override
    public SpecialiteResponse create(SpecialiteRequest request) {

        // 1. Vérifier que le technicien existe
        Utilisateur technicien = userRepository.findById(request.getTechnicienId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Technicien introuvable avec l'id : " + request.getTechnicienId()));

        // 2. Vérifier que c'est bien un technicien
        if (technicien.getRole() != Role.TECHNICIEN) {
            throw new BadRequestException(
                    "L'utilisateur sélectionné n'est pas un technicien");
        }

        // 3. Vérifier que la catégorie existe
        Categorie categorie = categorieRepository.findById(request.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Catégorie introuvable avec l'id : " + request.getCategorieId()));

        // 4. Vérifier le doublon (un technicien ne peut pas avoir 2 fois la même catégorie)
        if (specialiteRepository.existsByTechnicienIdAndCategorieId(
                request.getTechnicienId(), request.getCategorieId())) {
            throw new BadRequestException(
                    "Ce technicien possède déjà une spécialité dans cette catégorie");
        }

        // 5. Créer la spécialité
        SpecialiteTechnicien specialite = SpecialiteTechnicien.builder()
                .technicien(technicien)
                .categorie(categorie)
                .niveau(parseNiveau(request.getNiveau()))
                .build();

        return toResponse(specialiteRepository.save(specialite));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialiteResponse> findByTechnicien(UUID technicienId) {
        return specialiteRepository.findByTechnicienId(technicienId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID id) {
        SpecialiteTechnicien specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Spécialité introuvable avec l'id : " + id));
        specialiteRepository.delete(specialite);
    }

    // ---------- méthodes utilitaires ----------

    private NiveauSpecialite parseNiveau(String niveau) {
        try {
            return NiveauSpecialite.valueOf(niveau.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Niveau invalide : " + niveau
                    + " (valeurs autorisées : JUNIOR, CONFIRME, EXPERT)");
        }
    }

    private SpecialiteResponse toResponse(SpecialiteTechnicien s) {
        return SpecialiteResponse.builder()
                .id(s.getId())
                .technicienId(s.getTechnicien().getId())
                .technicienNom(s.getTechnicien().getNom() + " " + s.getTechnicien().getPrenom())
                .categorieId(s.getCategorie().getId())
                .categorieLibelle(s.getCategorie().getLibelle())
                .niveau(s.getNiveau().name())
                .build();
    }
}