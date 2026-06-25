// src/modules/referentiels/pages/Equipements.jsx
import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import { Monitor, Plus, Pencil, Trash2, Search, X } from "lucide-react";

const STATUT_COLORS = {
    OPERATIONNEL:   "bg-green-50 text-green-700",
    EN_PANNE:       "bg-red-50 text-red-700",
    EN_MAINTENANCE: "bg-yellow-50 text-yellow-700",
    HORS_SERVICE:   "bg-slate-100 text-slate-600",
};

const STATUT_LABELS = {
    OPERATIONNEL:   "Opérationnel",
    EN_PANNE:       "En panne",
    EN_MAINTENANCE: "En maintenance",
    HORS_SERVICE:   "Hors service",
};

const STATUT_DOT = {
    OPERATIONNEL:   "bg-green-500",
    EN_PANNE:       "bg-red-500",
    EN_MAINTENANCE: "bg-yellow-500",
    HORS_SERVICE:   "bg-slate-400",
};

const STATUTS = ["OPERATIONNEL", "EN_PANNE", "EN_MAINTENANCE", "HORS_SERVICE"];

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
}

export default function Equipements() {
    const [equipements, setEquipements] = useState([]);
    const [localisations, setLocalisations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatut, setFilterStatut] = useState("");
    const [filterLocalisation, setFilterLocalisation] = useState("");
    const [filterSearch, setFilterSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        reference: "", nom: "", type: "", statut: "OPERATIONNEL",
        description: "", localisationId: "", dateMiseEnService: "",
    });

    const fetchAll = async () => {
        setLoading(true);
        setError("");
        try {
            const [equipRes, locRes] = await Promise.all([
                axios.get("/api/admin/equipements"),
                axios.get("/api/admin/localisations"),
            ]);
            setEquipements(equipRes.data);
            setLocalisations(locRes.data);
        } catch {
            setError("Erreur lors du chargement.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreateForm = () => {
        setEditingId(null);
        setForm({ reference: "", nom: "", type: "", statut: "OPERATIONNEL", description: "", localisationId: "", dateMiseEnService: "" });
        setShowForm(true);
    };

    const openEditForm = (eq) => {
        setEditingId(eq.id);
        setForm({
            reference: eq.reference || "",
            nom: eq.nom,
            type: eq.type,
            statut: eq.statut || "OPERATIONNEL",
            description: eq.description || "",
            localisationId: eq.localisationId,
            dateMiseEnService: eq.dateMiseEnService || "",
        });
        setShowForm(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const payload = { ...form, dateMiseEnService: form.dateMiseEnService || null };
            if (editingId) {
                await axios.put(`/api/admin/equipements/${editingId}`, payload);
            } else {
                await axios.post("/api/admin/equipements", payload);
            }
            setShowForm(false);
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cet équipement ?")) return;
        try {
            await axios.delete(`/api/admin/equipements/${id}`);
            fetchAll();
        } catch {
            setError("Erreur lors de la suppression.");
        }
    };

    const filtered = equipements.filter((eq) => {
        const matchSearch = filterSearch
            ? eq.nom.toLowerCase().includes(filterSearch.toLowerCase()) ||
            (eq.reference || "").toLowerCase().includes(filterSearch.toLowerCase())
            : true;
        const matchStatut = filterStatut ? eq.statut === filterStatut : true;
        const matchLoc = filterLocalisation ? eq.localisationId === filterLocalisation : true;
        return matchSearch && matchStatut && matchLoc;
    });

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-slate-900">Équipements</h1>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Nouvel équipement
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par référence ou nom..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    />
                </div>
                <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent text-slate-600"
                >
                    <option value="">Tous les statuts</option>
                    {STATUTS.map((s) => (
                        <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                    ))}
                </select>
                <select
                    value={filterLocalisation}
                    onChange={(e) => setFilterLocalisation(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent text-slate-600"
                >
                    <option value="">Tous les sites</option>
                    {localisations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.libelle}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-[#1B7A5A] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <table className="min-w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Référence</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Équipement</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Site</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mise en service</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Créé le</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filtered.map((eq) => (
                                <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {eq.reference ? (
                                            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                          {eq.reference}
                        </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-[#1B7A5A]/10 rounded-lg">
                                                <Monitor size={14} className="text-[#1B7A5A]" />
                                            </div>
                                            <span className="font-medium text-slate-900 text-sm">{eq.nom}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{eq.type}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{eq.localisationLibelle}</td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[eq.statut]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUT_DOT[eq.statut]}`} />
                          {STATUT_LABELS[eq.statut]}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{formatDate(eq.dateMiseEnService)}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{formatDate(eq.dateCreation)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditForm(eq)}
                                                className="p-1.5 text-slate-400 hover:text-[#1B7A5A] hover:bg-green-50 rounded-lg transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(eq.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500 text-sm">
                                        Aucun équipement trouvé.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
                            {filtered.length} équipement{filtered.length !== 1 ? "s" : ""}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingId ? "Modifier l'équipement" : "Nouvel équipement"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Référence</label>
                                    <input
                                        type="text"
                                        name="reference"
                                        value={form.reference}
                                        onChange={handleChange}
                                        placeholder="Ex : CL-001"
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={form.nom}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex : Climatiseur Daikin"
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex : CVC, Électrique..."
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Statut</label>
                                    <select
                                        name="statut"
                                        value={form.statut}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                    >
                                        {STATUTS.map((s) => (
                                            <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Site / Localisation <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="localisationId"
                                    value={form.localisationId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                >
                                    <option value="">-- Choisir une localisation --</option>
                                    {localisations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.libelle} ({loc.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mise en service</label>
                                <input
                                    type="date"
                                    name="dateMiseEnService"
                                    value={form.dateMiseEnService}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Description optionnelle..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-lg bg-[#1B7A5A] hover:bg-[#15634A] text-white text-sm font-medium transition-colors"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}