package ma.gmsi.gmsi_backend.service;

import ma.gmsi.gmsi_backend.dto.request.CreateRapportRequest;
import ma.gmsi.gmsi_backend.dto.response.RapportResponse;

import java.util.UUID;

public interface RapportService {

    // --- Technicien ---
    RapportResponse creer(CreateRapportRequest request, UUID technicienId);

    // --- Commun ---
    RapportResponse getByIntervention(UUID interventionId);

    // --- Employé ---
    RapportResponse validerCloture(UUID interventionId, String signature, UUID employeId);
}