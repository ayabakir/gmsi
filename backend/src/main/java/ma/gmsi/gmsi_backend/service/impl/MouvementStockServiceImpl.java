// gmsi-mono/backend/src/main/java/ma/gmsi/gmsi_backend/service/impl/MouvementStockServiceImpl.java

package ma.gmsi.gmsi_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.gmsi.gmsi_backend.audit.Auditable;
import ma.gmsi.gmsi_backend.dto.request.PieceRechangeRequest;
import ma.gmsi.gmsi_backend.dto.response.MouvementStockResponse;
import ma.gmsi.gmsi_backend.dto.response.PieceRechangeResponse;
import ma.gmsi.gmsi_backend.entity.MouvementStock;
import ma.gmsi.gmsi_backend.entity.PieceRechange;
import ma.gmsi.gmsi_backend.entity.Utilisateur;
import ma.gmsi.gmsi_backend.entity.enums.TypeMouvement;
import ma.gmsi.gmsi_backend.exception.BadRequestException;
import ma.gmsi.gmsi_backend.exception.ResourceNotFoundException;
import ma.gmsi.gmsi_backend.repository.MouvementStockRepository;
import ma.gmsi.gmsi_backend.repository.PieceRechangeRepository;
import ma.gmsi.gmsi_backend.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import ma.gmsi.gmsi_backend.service.MouvementStockService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MouvementStockServiceImpl implements MouvementStockService {

    private final PieceRechangeRepository pieceRechangeRepository;
    private final MouvementStockRepository mouvementStockRepository;

    // ----------------- Pièces -----------------

    @Override
    @Auditable(action = "CREATION_PIECE", entiteType = "PIECE_RECHANGE")
    public PieceRechangeResponse creerPiece(PieceRechangeRequest request) {
        if (pieceRechangeRepository.existsByReference(request.getReference())) {
            throw new BadRequestException(
                    "Une pièce avec la référence '" + request.getReference() + "' existe déjà");
        }

        PieceRechange piece = PieceRechange.builder()
                .nom(request.getNom())
                .reference(request.getReference())
                .description(request.getDescription())
                .stockDisponible(request.getStockDisponible())
                .seuilAlerte(request.getSeuilAlerte())
                .build();

        PieceRechange saved = pieceRechangeRepository.save(piece);
        return toPieceResponse(saved);
    }

    @Override
    @Auditable(action = "MODIFICATION_PIECE", entiteType = "PIECE_RECHANGE")
    public PieceRechangeResponse modifierPiece(UUID id, PieceRechangeRequest request) {
        PieceRechange piece = getPieceOrThrow(id);

        // Si la référence change, vérifier qu'elle n'est pas déjà prise par une autre pièce
        if (!piece.getReference().equals(request.getReference())
                && pieceRechangeRepository.existsByReference(request.getReference())) {
            throw new BadRequestException(
                    "Une pièce avec la référence '" + request.getReference() + "' existe déjà");
        }

        piece.setNom(request.getNom());
        piece.setReference(request.getReference());
        piece.setDescription(request.getDescription());
        piece.setStockDisponible(request.getStockDisponible());
        piece.setSeuilAlerte(request.getSeuilAlerte());

        PieceRechange updated = pieceRechangeRepository.save(piece);
        return toPieceResponse(updated);
    }

    @Override
    @Auditable(action = "SUPPRESSION_PIECE", entiteType = "PIECE_RECHANGE")
    public void supprimerPiece(UUID id) {
        PieceRechange piece = getPieceOrThrow(id);

        if (mouvementStockRepository.existsByPiece_Id(id)) {
            throw new BadRequestException(
                    "Impossible de supprimer cette pièce : des mouvements de stock existent déjà pour elle. "
                            + "L'historique des mouvements doit être préservé.");
        }

        pieceRechangeRepository.delete(piece);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PieceRechangeResponse> listerPieces() {
        return pieceRechangeRepository.findAll()
                .stream()
                .map(this::toPieceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PieceRechangeResponse getPiece(UUID id) {
        return toPieceResponse(getPieceOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PieceRechangeResponse> getPiecesSousSeuilAlerte() {
        return pieceRechangeRepository.findPiecesSousSeuilAlerte()
                .stream()
                .map(this::toPieceResponse)
                .collect(Collectors.toList());
    }

    // ----------------- Mouvements -----------------

    @Override
    @Auditable(action = "ENTREE_STOCK", entiteType = "MOUVEMENT_STOCK")
    public MouvementStockResponse creerEntree(UUID pieceId, int quantite, String motif, UUID userId) {
        PieceRechange piece = getPieceOrThrow(pieceId);

        piece.setStockDisponible(piece.getStockDisponible() + quantite);
        pieceRechangeRepository.save(piece);

        MouvementStock mouvement = MouvementStock.builder()
                .piece(piece)
                .type(TypeMouvement.ENTREE)
                .quantite(quantite)
                .motif(motif)
                .utilisateur(Utilisateur.builder().id(userId).build())
                .build();

        MouvementStock saved = mouvementStockRepository.save(mouvement);
        return toMouvementResponse(saved);
    }

    @Override
    @Auditable(action = "SORTIE_STOCK", entiteType = "MOUVEMENT_STOCK")
    public MouvementStockResponse creerSortie(UUID pieceId, int quantite, String motif, UUID userId, UUID interventionId) {
        PieceRechange piece = getPieceOrThrow(pieceId);

        // RG07 — règle de gestion critique : pas de sortie partielle, rejet net si stock insuffisant
        if (piece.getStockDisponible() - quantite < 0) {
            throw new BadRequestException("Stock insuffisant");
        }

        piece.setStockDisponible(piece.getStockDisponible() - quantite);
        pieceRechangeRepository.save(piece);

        MouvementStock mouvement = MouvementStock.builder()
                .piece(piece)
                .type(TypeMouvement.SORTIE)
                .quantite(quantite)
                .motif(motif)
                .utilisateur(Utilisateur.builder().id(userId).build())
                .idIntervention(interventionId)
                .build();

        MouvementStock saved = mouvementStockRepository.save(mouvement);
        return toMouvementResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MouvementStockResponse> listerMouvements() {
        return mouvementStockRepository.findAllByOrderByDateMouvementDesc()
                .stream()
                .map(this::toMouvementResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MouvementStockResponse> getMouvementsByPiece(UUID pieceId) {
        // Vérifie que la pièce existe (404 sinon)
        getPieceOrThrow(pieceId);

        return mouvementStockRepository.findByPiece_Id(pieceId)
                .stream()
                .map(this::toMouvementResponse)
                .collect(Collectors.toList());
    }

    // ----------------- Helpers -----------------

    /**
     * Récupère l'UUID de l'utilisateur actuellement authentifié, à partir
     * du contexte de sécurité Spring Security.
     */
    public static UUID getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return principal.getId();
    }

    private PieceRechange getPieceOrThrow(UUID id) {
        return pieceRechangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pièce de rechange introuvable avec l'id : " + id));
    }

    private PieceRechangeResponse toPieceResponse(PieceRechange piece) {
        boolean sousSeuilAlerte = piece.getStockDisponible() <= piece.getSeuilAlerte();

        return PieceRechangeResponse.builder()
                .id(piece.getId())
                .nom(piece.getNom())
                .reference(piece.getReference())
                .description(piece.getDescription())
                .stockDisponible(piece.getStockDisponible())
                .seuilAlerte(piece.getSeuilAlerte())
                .sousSeuilAlerte(sousSeuilAlerte)
                .build();
    }

    private MouvementStockResponse toMouvementResponse(MouvementStock mouvement) {
        return MouvementStockResponse.builder()
                .id(mouvement.getId())
                .type(mouvement.getType())
                .quantite(mouvement.getQuantite())
                .motif(mouvement.getMotif())
                .dateMouvement(mouvement.getDateMouvement())
                .nomPiece(mouvement.getPiece().getNom())
                .emailUtilisateur(mouvement.getUtilisateur().getEmail())
                .idIntervention(mouvement.getIdIntervention())
                .build();
    }
}