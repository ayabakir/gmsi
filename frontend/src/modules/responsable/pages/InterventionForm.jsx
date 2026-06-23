import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Save } from 'lucide-react'

const PRIORITES = ['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']
const DIFFICULTES = ['FACILE', 'MOYEN', 'DIFFICILE', 'CRITIQUE']

export default function InterventionForm() {
    const navigate = useNavigate()

    const [demandes, setDemandes] = useState([])      // demandes ASSIGNEE
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
                // Demandes validées (ASSIGNEE) + liste des techniciens
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
            const payload = {
                demandeId: form.demandeId,
                technicienId: form.technicienId,
                niveauPriorite: form.niveauPriorite,
                niveauDifficulte: form.niveauDifficulte,
            }
            if (form.datePlanifiee) {
                // Le backend attend un LocalDateTime → on ajoute les secondes
                payload.datePlanifiee = form.datePlanifiee + ':00'
            }
            await api.post('/api/responsable/interventions', payload)
            navigate('/responsable/interventions')
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

    if (loading) return <div className="text-gray-400">Chargement…</div>

    return (
        <div className="max-w-xl">
            <button
                onClick={() => navigate('/responsable/interventions')}
                className="flex items-center gap-2 text-[#546E7A] hover:text-[#1565C0] text-sm mb-4 transition-colors"
            >
                <ArrowLeft size={16} /> Retour
            </button>

            <h1 className="text-2xl font-bold text-[#1565C0] mb-1">Nouvelle intervention</h1>
            <p className="text-[#546E7A] text-sm mb-6">Créez une intervention depuis une demande validée</p>

            {erreur && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#546E7A] mb-1">Demande à traiter</label>
                    <select
                        name="demandeId"
                        value={form.demandeId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
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
                    <label className="block text-sm font-medium text-[#546E7A] mb-1">Technicien à affecter</label>
                    <select
                        name="technicienId"
                        value={form.technicienId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                    >
                        {techniciens.length === 0 && <option value="">Aucun technicien</option>}
                        {techniciens.map((t) => (
                            <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#546E7A] mb-1">Priorité</label>
                        <select
                            name="niveauPriorite"
                            value={form.niveauPriorite}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        >
                            {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#546E7A] mb-1">Difficulté</label>
                        <select
                            name="niveauDifficulte"
                            value={form.niveauDifficulte}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        >
                            {DIFFICULTES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#546E7A] mb-1">Date planifiée <span className="text-gray-400">(optionnel)</span></label>
                    <input
                        type="datetime-local"
                        name="datePlanifiee"
                        value={form.datePlanifiee}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                    />
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !form.demandeId || !form.technicienId}
                        className="flex items-center gap-2 bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
                    >
                        <Save size={18} />
                        {saving ? 'Création…' : 'Créer l\'intervention'}
                    </button>
                </div>
            </div>
        </div>
    )
}