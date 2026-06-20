// src/modules/referentiels/pages/Equipements.jsx
import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";

export default function Equipements() {
    const [equipements, setEquipements] = useState([]);
    const [localisations, setLocalisations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterLocalisation, setFilterLocalisation] = useState("");
    const [filterType, setFilterType] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ nom: "", type: "", description: "", localisationId: "" });

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
            setError("Erreur lors du chargement des équipements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreateForm = () => {
        setEditingId(null);
        setForm({ nom: "", type: "", description: "", localisationId: "" });
        setShowForm(true);
    };

    const openEditForm = (eq) => {
        setEditingId(eq.id);
        setForm({
            nom: eq.nom,
            type: eq.type,
            description: eq.description || "",
            localisationId: eq.localisationId,
        });
        setShowForm(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editingId) {
                await axios.put(`/api/admin/equipements/${editingId}`, form);
            } else {
                await axios.post("/api/admin/equipements", form);
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

    const filteredEquipements = equipements.filter((eq) => {
        const matchLoc = filterLocalisation ? eq.localisationId === filterLocalisation : true;
        const matchType = filterType
            ? eq.type.toLowerCase().includes(filterType.toLowerCase())
            : true;
        return matchLoc && matchType;
    });

    return (
        <div className="min-h-screen bg-[#FAF7F0] p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#34403A]">Équipements</h1>
                    <p className="text-sm text-[#7A8576] mt-1">Matériel physique par localisation</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="bg-[#8FB996] hover:bg-[#7BA683] text-white px-4 py-2 rounded-lg transition font-medium"
                >
                    + Nouvel équipement
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-4">
                <select
                    value={filterLocalisation}
                    onChange={(e) => setFilterLocalisation(e.target.value)}
                    className="border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] bg-white focus:outline-none focus:ring-2 focus:ring-[#8FB996] text-sm"
                >
                    <option value="">Toutes les localisations</option>
                    {localisations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                            {loc.libelle} ({loc.type})
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Filtrer par type..."
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] bg-white focus:outline-none focus:ring-2 focus:ring-[#8FB996] text-sm"
                />
            </div>

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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Localisation</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-[#7A8576] uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEADD]">
                        {filteredEquipements.map((eq) => (
                            <tr key={eq.id} className="hover:bg-[#FAF7F0] transition">
                                <td className="px-6 py-4 font-medium text-[#34403A]">{eq.nom}</td>
                                <td className="px-6 py-4">
                    <span className="text-xs bg-[#8FB996]/20 text-[#4A7A55] px-2 py-1 rounded-full font-medium">
                      {eq.type}
                    </span>
                                </td>
                                <td className="px-6 py-4 text-[#7A8576]">{eq.localisationLibelle}</td>
                                <td className="px-6 py-4 text-[#7A8576]">{eq.description || "—"}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => openEditForm(eq)}
                                        className="text-[#8FB996] hover:text-[#7BA683] font-medium text-sm"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(eq.id)}
                                        className="text-red-400 hover:text-red-600 font-medium text-sm"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredEquipements.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-[#7A8576]">
                                    Aucun équipement trouvé.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-[#EFEADD] rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-[#34403A] mb-4">
                            {editingId ? "Modifier l'équipement" : "Nouvel équipement"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Nom <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Type <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Localisation <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="localisationId"
                                    value={form.localisationId}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
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
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg border border-[#E3DECF] text-[#7A8576] hover:bg-[#FAF7F0] transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#8FB996] hover:bg-[#7BA683] text-white font-medium transition"
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