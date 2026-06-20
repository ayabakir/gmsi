// src/modules/stock/pages/Stock.jsx
import { useEffect, useState } from "react";
import { stockApi } from "../api/stock.api";

export default function Stock() {
    const [pieces, setPieces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtreAlertes, setFiltreAlertes] = useState(false);

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

    // ----- Formulaire Pièce -----

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
            setError(err.response?.data?.erreur || "Erreur lors de l'enregistrement. Vérifiez les champs.");
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

    // ----- Formulaire Mouvement (Entrée / Sortie) -----

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
        <div className="min-h-screen bg-[#FAF7F0] p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#34403A]">Stock & pièces de rechange</h1>
                    <p className="text-sm text-[#7A8576] mt-1">Gérez l'inventaire et les mouvements de stock</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => openMouvementForm("ENTREE")}
                        className="bg-white border border-[#E3DECF] hover:bg-[#FAF7F0] text-[#34403A] px-4 py-2 rounded-lg transition font-medium"
                    >
                        ↓ Entrée stock
                    </button>
                    <button
                        onClick={() => openMouvementForm("SORTIE")}
                        className="bg-white border border-[#E3DECF] hover:bg-[#FAF7F0] text-[#34403A] px-4 py-2 rounded-lg transition font-medium"
                    >
                        ↑ Sortie stock
                    </button>
                    <button
                        onClick={openCreateForm}
                        className="bg-[#8FB996] hover:bg-[#7BA683] text-white px-4 py-2 rounded-lg transition font-medium"
                    >
                        + Nouvelle pièce
                    </button>
                </div>
            </div>

            <div className="flex items-center mb-4">
                <label className="flex items-center gap-2 text-sm text-[#34403A] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filtreAlertes}
                        onChange={(e) => setFiltreAlertes(e.target.checked)}
                        className="rounded border-[#E3DECF] text-[#8FB996] focus:ring-[#8FB996]"
                    />
                    Afficher seulement les pièces en alerte
                </label>
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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Référence</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Seuil</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEADD]">
                        {pieces.map((piece) => (
                            <tr key={piece.id} className="hover:bg-[#FAF7F0] transition">
                                <td className="px-6 py-4 font-medium text-[#34403A]">{piece.nom}</td>
                                <td className="px-6 py-4 text-[#7A8576]">{piece.reference}</td>
                                <td className="px-6 py-4 text-[#34403A]">{piece.stockDisponible}</td>
                                <td className="px-6 py-4 text-[#7A8576]">{piece.seuilAlerte}</td>
                                <td className="px-6 py-4">
                                    {piece.sousSeuilAlerte ? (
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                            ⚠️ Alerte
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                            OK
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => openEditForm(piece)}
                                        className="text-[#8FB996] hover:text-[#7BA683] font-medium text-sm"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(piece.id)}
                                        className="text-red-400 hover:text-red-600 font-medium text-sm"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pieces.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-[#7A8576]">
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
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-[#EFEADD] rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-[#34403A] mb-4">
                            {editingId ? "Modifier la pièce" : "Nouvelle pièce"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Nom <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text" name="nom" value={form.nom} onChange={handleChange} required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Référence <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text" name="reference" value={form.reference} onChange={handleChange} required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">Description</label>
                                <textarea
                                    name="description" value={form.description} onChange={handleChange} rows={2}
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#34403A] mb-1">
                                        Stock disponible <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number" name="stockDisponible" min={0} value={form.stockDisponible} onChange={handleChange} required
                                        className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#34403A] mb-1">
                                        Seuil d'alerte <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number" name="seuilAlerte" min={0} value={form.seuilAlerte} onChange={handleChange} required
                                        className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                        className="px-4 py-2 rounded-lg border border-[#E3DECF] text-[#7A8576] hover:bg-[#FAF7F0] transition">
                                    Annuler
                                </button>
                                <button type="submit"
                                        className="px-4 py-2 rounded-lg bg-[#8FB996] hover:bg-[#7BA683] text-white font-medium transition">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Mouvement (Entrée / Sortie) */}
            {showMouvementForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-[#EFEADD] rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-[#34403A] mb-4">
                            {mouvementType === "ENTREE" ? "Entrée de stock" : "Sortie de stock"}
                        </h2>
                        <form onSubmit={handleMouvementSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Pièce <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="pieceId" value={mouvementForm.pieceId} onChange={handleMouvementChange} required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                >
                                    <option value="">— Sélectionner une pièce —</option>
                                    {pieces.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nom} ({p.reference}) — stock: {p.stockDisponible}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Quantité <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number" name="quantite" min={1} value={mouvementForm.quantite} onChange={handleMouvementChange} required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">Motif</label>
                                <input
                                    type="text" name="motif" value={mouvementForm.motif} onChange={handleMouvementChange}
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowMouvementForm(false)}
                                        className="px-4 py-2 rounded-lg border border-[#E3DECF] text-[#7A8576] hover:bg-[#FAF7F0] transition">
                                    Annuler
                                </button>
                                <button type="submit"
                                        className="px-4 py-2 rounded-lg bg-[#8FB996] hover:bg-[#7BA683] text-white font-medium transition">
                                    Confirmer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}