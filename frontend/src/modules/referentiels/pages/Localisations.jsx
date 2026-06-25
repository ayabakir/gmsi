// src/modules/referentiels/pages/Localisations.jsx
import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import { MapPin, Plus, Pencil, Trash2, ChevronDown, ChevronRight, X, Building2, Layers, BriefcaseBusiness, LayoutGrid } from "lucide-react";

const TYPES = ["BATIMENT", "ETAGE", "BUREAU", "SALLE"];

const TYPE_LABELS = {
    BATIMENT: "Bâtiment",
    ETAGE: "Étage",
    BUREAU: "Bureau",
    SALLE: "Salle",
};

const TYPE_COLORS = {
    BATIMENT: "bg-blue-50 text-blue-700",
    ETAGE:    "bg-purple-50 text-purple-700",
    BUREAU:   "bg-amber-50 text-amber-700",
    SALLE:    "bg-green-50 text-[#1B7A5A]",
};

const TYPE_ICONS = {
    BATIMENT: Building2,
    ETAGE:    Layers,
    BUREAU:   BriefcaseBusiness,
    SALLE:    LayoutGrid,
};

const ENFANT_LABEL = {
    BATIMENT: "étage",
    ETAGE:    "bureau",
    BUREAU:   "salle",
    SALLE:    "sous-élément",
};



function TreeNode({ node, onAddChild, onEdit, onDelete, level = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.enfants && node.enfants.length > 0;
    const Icon = TYPE_ICONS[node.type] || MapPin;
    const enfantCount = node.enfants?.length || 0;

    return (
        <div>
            <div
                className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                style={{ marginLeft: `${level * 28}px` }}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {/* Toggle expand */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 flex-shrink-0"
                    >
                        {hasChildren
                            ? expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />
                            : <span className="w-4" />}
                    </button>

                    {/* Icône type */}
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${TYPE_COLORS[node.type]} bg-opacity-20`}>
                        <Icon size={14} />
                    </div>

                    {/* Infos */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-900 text-sm">{node.libelle}</span>
                            {enfantCount > 0 && (
                                <span className="text-xs text-slate-400">
                  ({enfantCount} {ENFANT_LABEL[node.type]}{enfantCount > 1 ? "s" : ""})
                </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[node.type]}`}>
                {TYPE_LABELS[node.type]}
              </span>
                        </div>
                        {/* Chemin complet — affiché seulement si pas racine */}
                        {node.cheminComplet && node.parentId && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{node.cheminComplet}</p>
                        )}
                        {/* Description */}
                        {node.description && (
                            <p className="text-xs text-slate-500 mt-0.5 italic">{node.description}</p>
                        )}
                    </div>
                </div>

                {/* Actions — visibles au hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                    <button
                        onClick={() => onAddChild(node)}
                        className="flex items-center gap-1 text-xs text-[#1B7A5A] hover:bg-green-50 px-2 py-1 rounded-lg transition-colors font-medium whitespace-nowrap"
                    >
                        <Plus size={13} /> Sous-élément
                    </button>
                    <button
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-slate-400 hover:text-[#1B7A5A] hover:bg-green-50 rounded-lg transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(node)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Enfants */}
            {hasChildren && expanded && (
                <div className="border-l-2 border-slate-100 ml-8">
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
    const [form, setForm] = useState({ libelle: "", type: "BATIMENT", parentId: null, description: "" });
    const [parentLabel, setParentLabel] = useState(null);

    const fetchTree = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/admin/localisations/racines");
            setTree(res.data);
        } catch {
            setError("Erreur lors du chargement.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTree(); }, []);

    const countTotal = (nodes) =>
        nodes.reduce((acc, n) => acc + 1 + (n.enfants ? countTotal(n.enfants) : 0), 0);

    const openCreateRoot = () => {
        setEditingId(null);
        setForm({ libelle: "", type: "BATIMENT", parentId: null, description: "" });
        setParentLabel(null);
        setShowForm(true);
    };

    const openAddChild = (parentNode) => {
        setEditingId(null);
        setForm({ libelle: "", type: "ETAGE", parentId: parentNode.id, description: "" });
        setParentLabel(parentNode.cheminComplet || parentNode.libelle);
        setShowForm(true);
    };

    const openEdit = (node) => {
        setEditingId(node.id);
        setForm({
            libelle: node.libelle,
            type: node.type,
            parentId: node.parentId || null,
            description: node.description || "",
        });
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

    const total = countTotal(tree);



    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin size={20} className="text-[#1B7A5A]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Localisations</h1>
                        <p className="text-sm text-slate-500">
                            {tree.length} bâtiment{tree.length !== 1 ? "s" : ""} · {total} emplacement{total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreateRoot}
                    className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Nouveau bâtiment
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Légende types */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {TYPES.map((t) => (
                    <span key={t} className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[t]}`}>
            {TYPE_LABELS[t]}
          </span>
                ))}
            </div>

            {/* Arbre */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-[#1B7A5A] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tree.length === 0 ? (
                    <div className="text-center py-16">
                        <MapPin size={32} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">Aucune localisation pour le moment.</p>
                        <button
                            onClick={openCreateRoot}
                            className="mt-3 text-sm text-[#1B7A5A] hover:underline font-medium"
                        >
                            Créer le premier bâtiment
                        </button>
                    </div>
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

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingId ? "Modifier la localisation" : "Nouvelle localisation"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {parentLabel && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-2 rounded-lg">
                                <MapPin size={12} className="text-[#1B7A5A]" />
                                <span>Sous : <span className="font-medium text-slate-700">{parentLabel}</span></span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                                    placeholder="Ex : Bâtiment A, Étage 2, Bureau 204..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                >
                                    {TYPES.map((t) => (
                                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Ex : Bâtiment administratif principal, accès badge..."
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