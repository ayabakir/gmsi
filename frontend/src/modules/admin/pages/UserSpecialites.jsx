import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Plus, Trash2, Award } from 'lucide-react'

const NIVEAUX = ['JUNIOR', 'CONFIRME', 'EXPERT']

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
        return <div className="text-gray-400">Chargement…</div>
    }

    return (
        <div className="max-w-2xl">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-[#546E7A] hover:text-[#1565C0] text-sm mb-4 transition-colors"
            >
                <ArrowLeft size={16} /> Retour à la liste
            </button>

            <div className="flex items-center gap-2 mb-1">
                <Award className="text-[#1565C0]" size={24} />
                <h1 className="text-2xl font-bold text-[#1565C0]">Spécialités</h1>
            </div>
            <p className="text-[#546E7A] text-sm mb-6">
                Technicien : <span className="font-semibold">{technicien?.prenom} {technicien?.nom}</span>
            </p>

            {erreur && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* Formulaire d'ajout */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <h2 className="text-sm font-semibold text-[#546E7A] mb-3">Ajouter une spécialité</h2>
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-xs text-[#546E7A] mb-1">Catégorie</label>
                        <select
                            value={categorieId}
                            onChange={(e) => setCategorieId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        >
                            {categories.length === 0 && <option value="">Aucune catégorie</option>}
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.libelle}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-40">
                        <label className="block text-xs text-[#546E7A] mb-1">Niveau</label>
                        <select
                            value={niveau}
                            onChange={(e) => setNiveau(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        >
                            {NIVEAUX.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={ajouterSpecialite}
                        disabled={ajout || categories.length === 0}
                        className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
                    >
                        <Plus size={18} /> Ajouter
                    </button>
                </div>
            </div>

            {/* Liste des spécialités */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-[#546E7A] text-left">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Catégorie</th>
                        <th className="px-4 py-3 font-semibold">Niveau</th>
                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {specialites.length === 0 ? (
                        <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-400">Aucune spécialité</td></tr>
                    ) : (
                        specialites.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{s.categorieLibelle}</td>
                                <td className="px-4 py-3">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1565C0]">
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
    )
}