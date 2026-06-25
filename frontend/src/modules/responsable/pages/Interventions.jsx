import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { Plus, Wrench } from 'lucide-react'

const statutStyle = (s) => {
    switch (s) {
        case 'PLANIFIEE': return 'bg-yellow-50 text-yellow-700'
        case 'EN_COURS':  return 'bg-indigo-50 text-indigo-700'
        case 'TERMINEE':  return 'bg-green-50 text-green-700'
        case 'CLOTUREE':  return 'bg-gray-100 text-gray-600'
        default:          return 'bg-gray-100 text-gray-600'
    }
}

export default function Interventions() {
    const [interventions, setInterventions] = useState([])
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')
    const navigate = useNavigate()

    const charger = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const { data } = await api.get('/api/responsable/interventions')
            setInterventions(data)
        } catch (e) {
            setErreur(e.response?.data?.erreur || "Erreur lors du chargement")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { charger() }, [charger])

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Wrench size={22} className="text-[#1B7A5A]" />
                            <h1 className="text-slate-900 font-semibold text-xl">Interventions</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-9">Gestion et affectation des interventions</p>
                    </div>
                    <button
                        onClick={() => navigate('/responsable/interventions/nouvelle')}
                        className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus size={18} /> Nouvelle intervention
                    </button>
                </div>
            </div>

            {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* ── Tableau ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 text-xs text-slate-600 uppercase">
                            <th className="px-4 py-3 text-left font-semibold">Référence</th>
                            <th className="px-4 py-3 text-left font-semibold">Demande</th>
                            <th className="px-4 py-3 text-left font-semibold">Technicien</th>
                            <th className="px-4 py-3 text-left font-semibold">Priorité</th>
                            <th className="px-4 py-3 text-left font-semibold">Statut</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">Chargement…</td></tr>
                        ) : interventions.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                                <Wrench size={24} className="mx-auto mb-2 opacity-40" />
                                Aucune intervention
                            </td></tr>
                        ) : (
                            interventions.map((i) => (
                                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#1B7A5A]">{i.reference}</td>
                                    <td className="px-4 py-3 text-slate-600">{i.demandeReference}</td>
                                    <td className="px-4 py-3 text-slate-700">{i.technicienNom || '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{i.niveauPriorite}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statutStyle(i.statut)}`}>
                                            {i.statut}
                                        </span>
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