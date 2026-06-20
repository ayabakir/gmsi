// src/modules/stock/pages/Mouvements.jsx
import { useEffect, useState } from "react";
import { stockApi } from "../api/stock.api";

export default function Mouvements() {
    const [mouvements, setMouvements] = useState([]);
    const [pieces, setPieces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtrePieceId, setFiltrePieceId] = useState("");

    const fetchPieces = async () => {
        try {
            const res = await stockApi.listerPieces();
            setPieces(res.data);
        } catch {
            // silencieux : utilisé seulement pour le select de filtre
        }
    };

    const fetchMouvements = async () => {
        setLoading(true);
        setError("");
        try {
            const res = filtrePieceId
                ? await stockApi.getMouvementsByPiece(filtrePieceId)
                : await stockApi.listerMouvements();
            setMouvements(res.data);
        } catch {
            setError("Erreur lors du chargement des mouvements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPieces(); }, []);
    useEffect(() => { fetchMouvements(); }, [filtrePieceId]);

    const formatDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleString("fr-FR", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-[#FAF7F0] p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#34403A]">Historique des mouvements</h1>
                <p className="text-sm text-[#7A8576] mt-1">Suivi des entrées et sorties de stock</p>
            </div>

            <div className="mb-4 max-w-xs">
                <label className="block text-sm font-medium text-[#34403A] mb-1">Filtrer par pièce</label>
                <select
                    value={filtrePieceId}
                    onChange={(e) => setFiltrePieceId(e.target.value)}
                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-white"
                >
                    <option value="">Toutes les pièces</option>
                    {pieces.map((p) => (
                        <option key={p.id} value={p.id}>{p.nom} ({p.reference})</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#8FB996] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white border border-[#EFEADD] rounded-xl overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                        <tr className="bg-[#FAF7F0] border-b border-[#EFEADD]">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Pièce</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Quantité</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Motif</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Utilisateur</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEADD]">
                        {mouvements.map((m) => (
                            <tr key={m.id} className="hover:bg-[#FAF7F0] transition">
                                <td className="px-6 py-4 text-[#7A8576] whitespace-nowrap">{formatDate(m.dateMouvement)}</td>
                                <td className="px-6 py-4 font-medium text-[#34403A]">{m.nomPiece}</td>
                                <td className="px-6 py-4">
                                    {m.type === "ENTREE" ? (
                                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                            ENTREE
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                            SORTIE
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-[#34403A]">{m.quantite}</td>
                                <td className="px-6 py-4 text-[#7A8576]">{m.motif || "—"}</td>
                                <td className="px-6 py-4 text-[#7A8576]">{m.emailUtilisateur}</td>
                            </tr>
                        ))}
                        {mouvements.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-[#7A8576]">
                                    Aucun mouvement pour le moment.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}