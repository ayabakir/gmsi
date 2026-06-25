// frontend/src/modules/stock/pages/Mouvements.jsx
import { useEffect, useState } from "react";
import { History, Search } from "lucide-react";
import { stockApi } from "../api/stock.api";

export default function Mouvements() {
    const [mouvements, setMouvements] = useState([]);
    const [pieces, setPieces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtrePieceId, setFiltrePieceId] = useState("");
    const [search, setSearch] = useState("");

    const fetchPieces = async () => {
        try {
            const res = await stockApi.listerPieces();
            setPieces(res.data);
        } catch { /* silencieux */ }
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
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const mouvementsFiltres = mouvements.filter(m =>
        m.nomPiece?.toLowerCase().includes(search.toLowerCase()) ||
        m.motif?.toLowerCase().includes(search.toLowerCase()) ||
        m.emailUtilisateur?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 bg-white min-h-screen">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <History size={20} className="text-[#1B7A5A]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Historique des mouvements</h1>
                    <p className="text-sm text-slate-500">Suivi des entrées et sorties de stock</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par pièce, motif, utilisateur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    />
                </div>
                <select
                    value={filtrePieceId}
                    onChange={(e) => setFiltrePieceId(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent bg-white text-slate-600"
                >
                    <option value="">Toutes les pièces</option>
                    {pieces.map((p) => (
                        <option key={p.id} value={p.id}>{p.nom} ({p.reference})</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#1B7A5A] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-slate-200">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pièce</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantité</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Motif</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Utilisateur</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {mouvementsFiltres.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-sm">{formatDate(m.dateMouvement)}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 text-sm">{m.nomPiece}</td>
                                <td className="px-6 py-4">
                                    {m.type === "ENTREE" ? (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                            Entrée
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                                            Sortie
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-900 text-sm font-medium">{m.quantite}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{m.motif || "—"}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{m.emailUtilisateur}</td>
                            </tr>
                        ))}
                        {mouvementsFiltres.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
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