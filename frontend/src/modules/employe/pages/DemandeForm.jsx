import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Save, FilePlus } from 'lucide-react'

const URGENCES = ['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']

export default function DemandeForm() {
    const navigate = useNavigate()

    const [equipements, setEquipements] = useState([])
    const [localisations, setLocalisations] = useState([])
    const [categories, setCategories] = useState([])

    const [form, setForm] = useState({
        description: '',
        equipementId: '',
        niveauUrgence: 'MOYENNE',
        localisationId: '',
        categorieId: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [erreur, setErreur] = useState('')

    // Charger les listes déroulantes (équipements, localisations, catégories)
    useEffect(() => {
        const charger = async () => {
            try {
                const [eqRes, locRes, catRes] = await Promise.all([
                    api.get('/api/admin/equipements'),
                    api.get('/api/admin/localisations'),
                    api.get('/api/admin/categories'),
                ])
                setEquipements(eqRes.data)
                setLocalisations(locRes.data)
                setCategories(catRes.data)
                if (eqRes.data.length > 0) {
                    setForm((f) => ({ ...f, equipementId: eqRes.data[0].id }))
                }
            } catch (e) {
                setErreur("Erreur lors du chargement des listes")
            } finally {
                setLoading(false)
            }
        }
        charger()
    }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setSaving(true)
        setErreur('')
        try {
            // On n'envoie categorieId/localisationId que s'ils sont remplis
            const payload = {
                description: form.description,
                equipementId: form.equipementId,
                niveauUrgence: form.niveauUrgence,
            }
            if (form.localisationId) payload.localisationId = form.localisationId
            if (form.categorieId) payload.categorieId = form.categorieId

            await api.post('/api/employe/demandes', payload)
            navigate('/employe/demandes')
        } catch (e) {
            const msg = e.response?.data?.erreur
                || (e.response?.data?.champs
                    ? Object.values(e.response.data.champs).join(', ')
                    : "Erreur lors de l'enregistrement")
            setErreur(msg)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="text-slate-400 text-sm">Chargement…</div>

    return (
        <div className="max-w-xl space-y-6">

            {/* Retour */}
            <button
                onClick={() => navigate('/employe/demandes')}
                className="flex items-center gap-2 text-slate-500 hover:text-[#1B7A5A] text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Retour
            </button>

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <FilePlus size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Nouvelle demande</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">Déclarez une panne ou un dysfonctionnement</p>
            </div>

            {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* ── Formulaire ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description de la panne</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        placeholder="Décrivez le problème rencontré…"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Équipement concerné</label>
                    <select
                        name="equipementId"
                        value={form.equipementId}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                    >
                        {equipements.length === 0 && <option value="">Aucun équipement</option>}
                        {equipements.map((eq) => (
                            <option key={eq.id} value={eq.id}>{eq.nom}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Niveau d'urgence</label>
                        <select
                            name="niveauUrgence"
                            value={form.niveauUrgence}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        >
                            {URGENCES.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Localisation <span className="text-slate-400">(optionnel)</span></label>
                        <select
                            name="localisationId"
                            value={form.localisationId}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        >
                            <option value="">—</option>
                            {localisations.map((loc) => (
                                <option key={loc.id} value={loc.id}>{loc.libelle}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Catégorie <span className="text-slate-400">(optionnel)</span></label>
                    <select
                        name="categorieId"
                        value={form.categorieId}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                    >
                        <option value="">—</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.libelle}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !form.description || !form.equipementId}
                        className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <Save size={18} />
                        {saving ? 'Envoi…' : 'Envoyer la demande'}
                    </button>
                </div>
            </div>
        </div>
    )
}