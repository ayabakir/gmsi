// src/modules/referentiels/pages/Categories.jsx
import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import { Tag, Plus, Pencil, Trash2, X, Search } from "lucide-react";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ libelle: "", description: "" });
    const [filterSearch, setFilterSearch] = useState("");

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
            setError("Erreur lors de l'enregistrement.");
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

    const filtered = categories.filter((cat) =>
        filterSearch
            ? cat.libelle.toLowerCase().includes(filterSearch.toLowerCase()) ||
            (cat.description || "").toLowerCase().includes(filterSearch.toLowerCase())
            : true
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <Tag size={20} className="text-[#1B7A5A]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Catégories de pannes</h1>
                        <p className="text-sm text-slate-500">{categories.length} catégorie{categories.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Nouvelle catégorie
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Filtre */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    />
                </div>
                {filterSearch && (
                    <button
                        onClick={() => setFilterSearch("")}
                        className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-500 bg-white hover:bg-gray-50 flex items-center gap-1.5"
                    >
                        <X size={14} /> Effacer
                    </button>
                )}
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Libellé</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filtered.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-[#1B7A5A]" />
                                            <span className="font-medium text-slate-900">{cat.libelle}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{cat.description || "—"}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditForm(cat)}
                                                className="p-1.5 text-slate-400 hover:text-[#1B7A5A] hover:bg-green-50 rounded-lg transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
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
                                    <td colSpan={3} className="px-6 py-16 text-center text-slate-500 text-sm">
                                        {filterSearch ? `Aucun résultat pour "${filterSearch}".` : "Aucune catégorie pour le moment."}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
                            {filtered.length} catégorie{filtered.length !== 1 ? "s" : ""}
                            {filterSearch && ` · filtrées sur "${filterSearch}"`}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Libellé <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="libelle"
                                    value={form.libelle}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex : Électrique, Mécanique..."
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