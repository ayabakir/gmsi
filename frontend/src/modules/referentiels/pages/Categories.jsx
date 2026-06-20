// src/modules/referentiels/pages/Categories.jsx
import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ libelle: "", description: "" });

    const fetchCategories = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/admin/categories");
            setCategories(res.data);
        } catch {
            setError("Erreur lors du chargement des catégories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openCreateForm = () => {
        setEditingId(null);
        setForm({ libelle: "", description: "" });
        setShowForm(true);
    };

    const openEditForm = (cat) => {
        setEditingId(cat.id);
        setForm({ libelle: cat.libelle, description: cat.description || "" });
        setShowForm(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editingId) {
                await axios.put(`/api/admin/categories/${editingId}`, form);
            } else {
                await axios.post("/api/admin/categories", form);
            }
            setShowForm(false);
            fetchCategories();
        } catch {
            setError("Erreur lors de l'enregistrement. Vérifiez les champs.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette catégorie ?")) return;
        try {
            await axios.delete(`/api/admin/categories/${id}`);
            fetchCategories();
        } catch {
            setError("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF7F0] p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#34403A]">Catégories de pannes</h1>
                    <p className="text-sm text-[#7A8576] mt-1">Gérez les types de pannes du système</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="bg-[#8FB996] hover:bg-[#7BA683] text-white px-4 py-2 rounded-lg transition font-medium"
                >
                    + Nouvelle catégorie
                </button>
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
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">
                                Libellé
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#7A8576] uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-[#7A8576] uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFEADD]">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-[#FAF7F0] transition">
                                <td className="px-6 py-4 font-medium text-[#34403A]">{cat.libelle}</td>
                                <td className="px-6 py-4 text-[#7A8576]">{cat.description || "—"}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => openEditForm(cat)}
                                        className="text-[#8FB996] hover:text-[#7BA683] font-medium text-sm"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-red-400 hover:text-red-600 font-medium text-sm"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-[#7A8576]">
                                    Aucune catégorie pour le moment.
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
                            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#34403A] mb-1">
                                    Libellé <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="libelle"
                                    value={form.libelle}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                />
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