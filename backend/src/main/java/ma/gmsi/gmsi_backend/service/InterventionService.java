package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.CreateInterventionRequest;
import ma.gmsi.gmsi_backend.dto.response.InterventionResponse;

import java.util.List;
import java.util.UUID;

public interface InterventionService {

    // --- Responsable ---
    InterventionResponse creer(CreateInterventionRequest request, UUID responsableId);
    List<InterventionResponse> toutes(String statut);

    // --- Commun ---
    InterventionResponse getById(UUID id);

    // --- Technicien ---
    List<InterventionResponse> mesInterventions(UUID technicienId);
    InterventionResponse demarrer(UUID id, String commentaire, UUID technicienId);
    InterventionResponse terminer(UUID id, String commentaire, UUID technicienId);
}