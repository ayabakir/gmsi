package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.CreateDemandeRequest;
import ma.gmsi.gmsi_backend.dto.response.DemandeResponse;

import java.util.List;
import java.util.UUID;

public interface DemandeService {

    // --- Employé ---
    DemandeResponse creer(CreateDemandeRequest request, UUID employeId);
    List<DemandeResponse> mesDemandes(UUID employeId);

    // --- Commun ---
    DemandeResponse getById(UUID id);

    // --- Responsable ---
    List<DemandeResponse> toutes(String statut); // statut optionnel (null = toutes)
    DemandeResponse valider(UUID id);
    DemandeResponse rejeter(UUID id, String motif);
}