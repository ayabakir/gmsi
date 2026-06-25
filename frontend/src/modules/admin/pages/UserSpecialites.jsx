import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Plus, Trash2, Award } from 'lucide-react'

const NIVEAUX = ['JUNIOR', 'CONFIRME', 'EXPERT']

const COULEURS_NIVEAU = {
    JUNIOR:   'bg-blue-50 text-blue-700',
    CONFIRME: 'bg-amber-50 text-amber-700',
    EXPERT:   'bg-green-50 text-[#1B7A5A]',
}

export default function UserSpecialites() {
    const { id } = useParams()        // id du technicien
    const navigate = useNavigate()

    const [technicien, setTechnicien] = useState(null)
    const [specialites, setSpecialites] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')

    // Formulaire d'ajout
    const [categorieId, setCategorieId] = useState('')
    const [niveau, setNiveau] = useState('JUNIOR')
    const [ajout, setAjout] = useState(false)

    const charger = async () => {
        setLoading(true)
        setErreur('')
        try {
            // Charger en parallèle : le technicien, ses spécialités, et les catégories
            const [techRes, specRes, catRes] = await Promise.all([
                api.get(`/api/admin/users/${id}`),
                api.get(`/api/admin/specialites/technicien/${id}`),
                api.get('/api/admin/categories'),
            ])
            setTechnicien(techRes.data)
            setSpecialites(specRes.data)
            setCategories(catRes.data)
            if (catRes.data.length > 0) setCategorieId(catRes.data[0].id)
        } catch (e) {
            setErreur("Erreur lors du chargement")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        charger()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const ajouterSpecialite = async () => {
        if (!categorieId) return
        setAjout(true)
        setErreur('')
        try {
            await api.post('/api/admin/specialites', {
                technicienId: id,
                categorieId: categorieId,
                niveau: niveau,
            })
            charger()
        } catch (e) {
            setErreur(
                e.response?.data?.erreur
                || e.response?.data?.message
                || "Erreur lors de l'ajout"
            )
        } finally {
            setAjout(false)
        }
    }

    const supprimerSpecialite = async (specId) => {
        if (!window.confirm('Supprimer cette spécialité ?')) return
        try {
            await api.delete(`/api/admin/specialites/${specId}`)
            charger()
        } catch (e) {
            setErreur("Erreur lors de la suppression")
        }
    }

    if (loading) {
        return <div className="text-slate-400 text-sm">Chargement…</div>
    }

    return (
        <div className="max-w-2xl space-y-6">

            {/* Retour */}
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-slate-500 hover:text-[#1B7A5A] text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Retour à la liste
            </button>

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <Award size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Spécialités</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">
                    Technicien : <span className="font-semibold text-slate-700">{technicien?.prenom} {technicien?.nom}</span>
                </p>
            </div>

            {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* ── Formulaire d'ajout ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ajouter une spécialité</h2>
                <div className="flex items-end gap-3 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs text-slate-500 mb-1">Catégorie</label>
                        <select
                            value={categorieId}
                            onChange={(e) => setCategorieId(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        >
                            {categories.length === 0 && <option value="">Aucune catégorie</option>}
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.libelle}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-40">
                        <label className="block text-xs text-slate-500 mb-1">Niveau</label>
                        <select
                            value={niveau}
                            onChange={(e) => setNiveau(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        >
                            {NIVEAUX.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={ajouterSpecialite}
                        disabled={ajout || categories.length === 0}
                        className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <Plus size={18} /> Ajouter
                    </button>
                </div>
            </div>

            {/* ── Liste des spécialités ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 text-xs text-slate-600 uppercase">
                            <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
                            <th className="px-4 py-3 text-left font-semibold">Niveau</th>
                            <th className="px-4 py-3 text-right font-semibold">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {specialites.length === 0 ? (
                            <tr><td colSpan="3" className="px-4 py-10 text-center text-slate-400">Aucune spécialité</td></tr>
                        ) : (
                            specialites.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{s.categorieLibelle}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${COULEURS_NIVEAU[s.niveau] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {s.niveau}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => supprimerSpecialite(s.id)}
                                            title="Supprimer"
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}