// src/modules/stock/api/stock.api.js
import axios from "../../../api/axiosConfig";

const BASE = "/api/responsable/stock";

export const stockApi = {
    // Pièces
    listerPieces: () => axios.get(`${BASE}/pieces`),
    getPiece: (id) => axios.get(`${BASE}/pieces/${id}`),
    creerPiece: (data) => axios.post(`${BASE}/pieces`, data),
    modifierPiece: (id, data) => axios.put(`${BASE}/pieces/${id}`, data),
    supprimerPiece: (id) => axios.delete(`${BASE}/pieces/${id}`),
    getPiecesSousSeuilAlerte: () => axios.get(`${BASE}/pieces/alertes`),

    // Mouvements
    listerMouvements: () => axios.get(`${BASE}/mouvements`),
    getMouvementsByPiece: (pieceId) => axios.get(`${BASE}/mouvements/piece/${pieceId}`),
    creerEntree: (data) => axios.post(`${BASE}/mouvements/entree`, data),
    creerSortie: (data) => axios.post(`${BASE}/mouvements/sortie`, data),
};