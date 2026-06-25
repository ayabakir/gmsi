import { useEffect, useState, useCallback } from 'react'
import api from '../../../api/axiosConfig'
import { Play, CheckCircle, Wrench } from 'lucide-react'

const statutStyle = (s) => {
    switch (s) {
        case 'PLANIFIEE': return 'bg-yellow-50 text-yellow-700'
        case 'EN_COURS':  return 'bg-indigo-50 text-indigo-700'
        case 'TERMINEE':  return 'bg-green-50 text-green-700'
        case 'CLOTUREE':  return 'bg-gray-100 text-gray-600'
        default:          return 'bg-gray-100 text-gray-600'
    }
}

export default function MesMissions() {
    const [missions, setMissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')

    const charger = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const { data } = await api.get('/api/technicien/interventions')
            setMissions(data)
        } catch (e) {
            setErreur(e.response?.data?.erreur || 'Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { charger() }, [charger])

    const demarrer = async (m) => {
        try {
            await api.put(`/api/technicien/interventions/${m.id}/demarrer`, {})
            charger()
        } catch (e) {
            setErreur(e.response?.data?.erreur || 'Erreur lors du démarrage')
        }
    }

    const terminer = async (m) => {
        const commentaire = window.prompt('Commentaire de fin (optionnel) :') || ''
        try {
            await api.put(`/api/technicien/interventions/${m.id}/terminer`, { commentaire })
            charger()
        } catch (e) {
            setErreur(e.response?.data?.erreur || 'Erreur lors de la clôture')
        }
    }

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <Wrench size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Mes missions</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">Vos interventions assignées</p>
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
                            <th className="px-4 py-3 text-left font-semibold">Description</th>
                            <th className="px-4 py-3 text-left font-semibold">Priorité</th>
                            <th className="px-4 py-3 text-left font-semibold">Statut</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">Chargement…</td></tr>
                        ) : missions.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                                <Wrench size={24} className="mx-auto mb-2 opacity-40" />
                                Aucune mission assignée
                            </td></tr>
                        ) : (
                            missions.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#1B7A5A]">{m.reference}</td>
                                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{m.demandeDescription}</td>
                                    <td className="px-4 py-3 text-slate-600">{m.niveauPriorite}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statutStyle(m.statut)}`}>
                                            {m.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {m.statut === 'PLANIFIEE' && (
                                                <button
                                                    onClick={() => demarrer(m)}
                                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                                                >
                                                    <Play size={16} /> Démarrer
                                                </button>
                                            )}
                                            {m.statut === 'EN_COURS' && (
                                                <button
                                                    onClick={() => terminer(m)}
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium transition-colors"
                                                >
                                                    <CheckCircle size={16} /> Terminer
                                                </button>
                                            )}
                                            {(m.statut === 'TERMINEE' || m.statut === 'CLOTUREE') && (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </div>
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