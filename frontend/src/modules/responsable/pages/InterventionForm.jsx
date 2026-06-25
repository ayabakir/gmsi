import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Save, Wrench } from 'lucide-react'

const PRIORITES = ['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']
const DIFFICULTES = ['FACILE', 'MOYEN', 'DIFFICILE', 'CRITIQUE']

export default function InterventionForm() {
    const navigate = useNavigate()

    const [demandes, setDemandes] = useState([])
    const [techniciens, setTechniciens] = useState([])

    const [form, setForm] = useState({
        demandeId: '',
        technicienId: '',
        niveauPriorite: 'MOYENNE',
        niveauDifficulte: 'MOYEN',
        datePlanifiee: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [erreur, setErreur] = useState('')

    useEffect(() => {
        const charger = async () => {
            try {
                const [demRes, techRes] = await Promise.all([
                    api.get('/api/responsable/demandes?statut=ASSIGNEE'),
                    api.get('/api/admin/users?role=TECHNICIEN'),
                ])
                setDemandes(demRes.data)
                setTechniciens(techRes.data)
                setForm((f) => ({
                    ...f,
                    demandeId: demRes.data[0]?.id || '',
                    technicienId: techRes.data[0]?.id || '',
                }))
            } catch (e) {
                setErreur('Erreur lors du chargement des listes')
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
            const payload = {
                demandeId: form.demandeId,
                technicienId: form.technicienId,
                niveauPriorite: form.niveauPriorite,
                niveauDifficulte: form.niveauDifficulte,
            }
            if (form.datePlanifiee) {
                payload.datePlanifiee = form.datePlanifiee + ':00'
            }
            await api.post('/api/responsable/interventions', payload)
            navigate('/responsable/interventions')
        } catch (e) {
            const msg = e.response?.data?.erreur
                || (e.response?.data?.champs
                    ? Object.values(e.response.data.champs).join(', ')
                    : 'Erreur lors de l enregistrement')
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
                onClick={() => navigate('/responsable/interventions')}
                className="flex items-center gap-2 text-slate-500 hover:text-[#1B7A5A] text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Retour
            </button>

            {/* En-tête */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <Wrench size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Nouvelle intervention</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">Cr&eacute;ez une intervention depuis une demande valid&eacute;e</p>
            </div>

            {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* Formulaire */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Demande à traiter</label>
                    <select
                        name="demandeId"
                        value={form.demandeId}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                    >
                        {demandes.length === 0 && <option value="">Aucune demande validée</option>}
                        {demandes.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.reference} — {d.description.substring(0, 40)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Technicien à affecter</label>
                    <select
                        name="technicienId"
                        value={form.technicienId}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                    >
                        {techniciens.length === 0 && <option value="">Aucun technicien</option>}
                        {techniciens.map((t) => (
                            <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Priorité</label>
                        <select
                            name="niveauPriorite"
                            value={form.niveauPriorite}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        >
                            {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulté</label>
                        <select
                            name="niveauDifficulte"
                            value={form.niveauDifficulte}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        >
                            {DIFFICULTES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Date planifiée <span className="text-slate-400">(optionnel)</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="datePlanifiee"
                        value={form.datePlanifiee}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                    />
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !form.demandeId || !form.technicienId}
                        className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <Save size={18} />
                        {saving ? 'Création…' : 'Créer une intervention'}
                    </button>
                </div>
            </div>
        </div>
    )
}