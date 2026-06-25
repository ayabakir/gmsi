// frontend/src/modules/stock/pages/Stock.jsx
import { useEffect, useState } from "react";
import { Package, Search, Plus, ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { stockApi } from "../api/stock.api";

export default function Stock() {
    const [pieces, setPieces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtreAlertes, setFiltreAlertes] = useState(false);
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        nom: "", reference: "", description: "", stockDisponible: 0, seuilAlerte: 0,
    });

    const [showMouvementForm, setShowMouvementForm] = useState(false);
    const [mouvementType, setMouvementType] = useState("ENTREE");
    const [mouvementForm, setMouvementForm] = useState({ pieceId: "", quantite: 1, motif: "" });

    const fetchPieces = async () => {
        setLoading(true);
        setError("");
        try {
            const res = filtreAlertes
                ? await stockApi.getPiecesSousSeuilAlerte()
                : await stockApi.listerPieces();
            setPieces(res.data);
        } catch {
            setError("Erreur lors du chargement des pièces.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPieces(); }, [filtreAlertes]);

    const piecesFiltrees = pieces.filter(p =>
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateForm = () => {
        setEditingId(null);
        setForm({ nom: "", reference: "", description: "", stockDisponible: 0, seuilAlerte: 0 });
        setShowForm(true);
    };

    const openEditForm = (piece) => {
        setEditingId(piece.id);
        setForm({
            nom: piece.nom,
            reference: piece.reference,
            description: piece.description || "",
            stockDisponible: piece.stockDisponible,
            seuilAlerte: piece.seuilAlerte,
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "stockDisponible" || name === "seuilAlerte" ? Number(value) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editingId) {
                await stockApi.modifierPiece(editingId, form);
            } else {
                await stockApi.creerPiece(form);
            }
            setShowForm(false);
            fetchPieces();
        } catch (err) {
            setError(err.response?.data?.erreur || "Erreur lors de l'enregistrement.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette pièce ?")) return;
        setError("");
        try {
            await stockApi.supprimerPiece(id);
            fetchPieces();
        } catch (err) {
            setError(err.response?.data?.erreur || "Erreur lors de la suppression.");
        }
    };

    const openMouvementForm = (type, pieceId = "") => {
        setMouvementType(type);
        setMouvementForm({ pieceId, quantite: 1, motif: "" });
        setShowMouvementForm(true);
    };

    const handleMouvementChange = (e) => {
        const { name, value } = e.target;
        setMouvementForm({ ...mouvementForm, [name]: name === "quantite" ? Number(value) : value });
    };

    const handleMouvementSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const payload = { ...mouvementForm, type: mouvementType };
        try {
            if (mouvementType === "ENTREE") {
                await stockApi.creerEntree(payload);
            } else {
                await stockApi.creerSortie(payload);
            }
            setShowMouvementForm(false);
            fetchPieces();
        } catch (err) {
            setError(err.response?.data?.erreur || "Erreur lors de l'enregistrement du mouvement.");
        }
    };

    return (
        <div className="bg-gradient-to-b from-[#E8F5EE] via-[#F2F9F5] to-white min-h-screen p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-[#1B7A5A] rounded-lg p-2">
                            <Package size={16} />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">Stock</h1>
                            <p className="text-xs text-slate-500">Pièces de rechange et inventaire</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openMouvementForm("ENTREE")}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <ArrowDown size={14} className="text-[#1B7A5A]" />
                            Entrée
                        </button>
                        <button
                            onClick={() => openMouvementForm("SORTIE")}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <ArrowUp size={14} className="text-amber-600" />
                            Sortie
                        </button>
                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center gap-1.5 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                            <Plus size={14} />
                            Nouvelle pièce
                        </button>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou référence…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filtreAlertes}
                            onChange={(e) => setFiltreAlertes(e.target.checked)}
                            className="rounded border-slate-200 text-[#1B7A5A] focus:ring-[#1B7A5A]"
                        />
                        Alertes uniquement
                    </label>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Tableau */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm flex items-center justify-center py-12">
                        <div className="w-5 h-5 border-2 border-[#1B7A5A] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Nom</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Référence</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Stock</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Seuil</th>
                                <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Statut</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {piecesFiltrees.map((piece) => (
                                <tr key={piece.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{piece.nom}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="text-xs font-mono text-slate-500">{piece.reference}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{piece.stockDisponible}</td>
                                    <td className="px-4 py-2.5 text-sm text-slate-500">{piece.seuilAlerte}</td>
                                    <td className="px-4 py-2.5">
                                        {piece.sousSeuilAlerte ? (
                                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700">
                                                    alerte
                                                </span>
                                        ) : (
                                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700">
                                                    ok
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                onClick={() => openEditForm(piece)}
                                                title="Modifier"
                                                className="p-1.5 rounded-lg text-[#1B7A5A] hover:bg-green-50 transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(piece.id)}
                                                title="Supprimer"
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {piecesFiltrees.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                                        Aucune pièce pour le moment.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal Pièce */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-md mx-4">
                            <h2 className="text-sm font-semibold text-slate-900 mb-4">
                                {editingId ? "Modifier la pièce" : "Nouvelle pièce"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">
                                        Nom <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text" name="nom" value={form.nom} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">
                                        Référence <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text" name="reference" value={form.reference} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                                    <textarea
                                        name="description" value={form.description} onChange={handleChange} rows={2}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-1">
                                            Stock disponible <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number" name="stockDisponible" min={0}
                                            value={form.stockDisponible} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 mb-1">
                                            Seuil d'alerte <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number" name="seuilAlerte" min={0}
                                            value={form.seuilAlerte} onChange={handleChange} required
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors">
                                        Annuler
                                    </button>
                                    <button type="submit"
                                            className="bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Mouvement */}
                {showMouvementForm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-md mx-4">
                            <div className="flex items-center gap-2 mb-4">
                                {mouvementType === "ENTREE"
                                    ? <ArrowDown size={16} className="text-[#1B7A5A]" />
                                    : <ArrowUp size={16} className="text-amber-600" />
                                }
                                <h2 className="text-sm font-semibold text-slate-900">
                                    {mouvementType === "ENTREE" ? "Entrée de stock" : "Sortie de stock"}
                                </h2>
                            </div>
                            <form onSubmit={handleMouvementSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">
                                        Pièce <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="pieceId" value={mouvementForm.pieceId}
                                        onChange={handleMouvementChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    >
                                        <option value="">— Sélectionner une pièce —</option>
                                        {pieces.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nom} ({p.reference}) — stock : {p.stockDisponible}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">
                                        Quantité <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number" name="quantite" min={1}
                                        value={mouvementForm.quantite} onChange={handleMouvementChange} required
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 mb-1">Motif</label>
                                    <input
                                        type="text" name="motif" value={mouvementForm.motif}
                                        onChange={handleMouvementChange}
                                        placeholder="Optionnel"
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowMouvementForm(false)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors">
                                        Annuler
                                    </button>
                                    <button type="submit"
                                            className="bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                                        Confirmer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}