// src/modules/referentiels/pages/Localisations.jsx
import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";

const TYPES = ["BATIMENT", "ETAGE", "BUREAU", "SALLE"];

const TYPE_LABELS = {
    BATIMENT: "Bâtiment",
    ETAGE: "Étage",
    BUREAU: "Bureau",
    SALLE: "Salle",
};

const TYPE_COLORS = {
    BATIMENT: "bg-[#8FB996]/20 text-[#4A7A55]",
    ETAGE: "bg-blue-50 text-blue-600",
    BUREAU: "bg-amber-50 text-amber-600",
    SALLE: "bg-purple-50 text-purple-600",
};

function TreeNode({ node, onAddChild, onEdit, onDelete, level = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.enfants && node.enfants.length > 0;

    return (
        <div>
            <div
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#FAF7F0] transition group"
                style={{ marginLeft: `${level * 24}px` }}
            >
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-5 h-5 flex items-center justify-center text-[#7A8576]"
                    >
                        {hasChildren ? (expanded ? "▾" : "▸") : <span className="w-5" />}
                    </button>
                    <span className="font-medium text-[#34403A]">{node.libelle}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[node.type]}`}>
            {TYPE_LABELS[node.type]}
          </span>
                    {node.parentLibelle && (
                        <span className="text-xs text-[#7A8576]">↳ {node.parentLibelle}</span>
                    )}
                </div>
                <div className="space-x-2 text-sm opacity-0 group-hover:opacity-100 transition">
                    <button
                        onClick={() => onAddChild(node)}
                        className="text-[#8FB996] hover:text-[#7BA683] font-medium"
                    >
                        + Sous-élément
                    </button>
                    <button
                        onClick={() => onEdit(node)}
                        className="text-[#7A8576] hover:text-[#34403A] font-medium"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(node)}
                        className="text-red-400 hover:text-red-600 font-medium"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            {hasChildren && expanded && (
                <div className="border-l border-[#EFEADD] ml-6">
                    {node.enfants.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Localisations() {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ libelle: "", type: "BATIMENT", parentId: null });
    const [parentLabel, setParentLabel] = useState(null);

    const fetchTree = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/admin/localisations/racines");
            setTree(res.data);
        } catch {
            setError("Erreur lors du chargement des localisations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTree(); }, []);

    const openCreateRoot = () => {
        setEditingId(null);
        setForm({ libelle: "", type: "BATIMENT", parentId: null });
        setParentLabel(null);
        setShowForm(true);
    };

    const openAddChild = (parentNode) => {
        setEditingId(null);
        setForm({ libelle: "", type: "ETAGE", parentId: parentNode.id });
        setParentLabel(parentNode.libelle);
        setShowForm(true);
    };

    const openEdit = (node) => {
        setEditingId(node.id);
        setForm({ libelle: node.libelle, type: node.type, parentId: node.parentId || null });
        setParentLabel(node.parentLibelle || null);
        setShowForm(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editingId) {
                await axios.put(`/api/admin/localisations/${editingId}`, form);
            } else {
                await axios.post("/api/admin/localisations", form);
            }
            setShowForm(false);
            fetchTree();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        }
    };

    const handleDelete = async (node) => {
        if (!window.confirm(`Supprimer "${node.libelle}" ?`)) return;
        try {
            await axios.delete(`/api/admin/localisations/${node.id}`);
            fetchTree();
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la suppression.");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF7F0] p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#34403A]">Localisations</h1>
                    <p className="text-sm text-[#7A8576] mt-1">Arborescence des sites, bâtiments et bureaux</p>
                </div>
                <button
                    onClick={openCreateRoot}
                    className="bg-[#8FB996] hover:bg-[#7BA683] text-white px-4 py-2 rounded-lg transition font-medium"
                >
                    + Nouveau bâtiment
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
                <div className="bg-white border border-[#EFEADD] rounded-xl p-4">
                    {tree.length === 0 ? (
                        <p className="text-center text-[#7A8576] py-12">
                            Aucune localisation pour le moment.
                        </p>
                    ) : (
                        tree.map((node) => (
                            <TreeNode
                                key={node.id}
                                node={node}
                                onAddChild={openAddChild}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-[#EFEADD] rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-[#34403A] mb-1">
                            {editingId ? "Modifier la localisation" : "Nouvelle localisation"}
                        </h2>
                        {parentLabel && (
                            <p className="text-sm text-[#7A8576] mb-4">
                                Sous-élément de : <span className="font-medium text-[#34403A]">{parentLabel}</span>
                            </p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
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
                                    Type <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full border border-[#E3DECF] rounded-lg px-3 py-2 text-[#34403A] focus:outline-none focus:ring-2 focus:ring-[#8FB996] bg-[#FAF7F0]"
                                >
                                    {TYPES.map((t) => (
                                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                                    ))}
                                </select>
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