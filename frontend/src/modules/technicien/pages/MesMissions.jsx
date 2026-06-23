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
            setErreur(e.response?.data?.erreur || "Erreur lors du chargement")
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
            setErreur(e.response?.data?.erreur || "Erreur lors du démarrage")
        }
    }

    const terminer = async (m) => {
        const commentaire = window.prompt("Commentaire de fin (optionnel) :") || ''
        try {
            await api.put(`/api/technicien/interventions/${m.id}/terminer`, { commentaire })
            charger()
        } catch (e) {
            setErreur(e.response?.data?.erreur || "Erreur lors de la clôture")
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1565C0]">Mes missions</h1>
                <p className="text-[#546E7A] text-sm mt-1">Vos interventions assignées</p>
            </div>

            {erreur && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-[#546E7A] text-left">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Référence</th>
                        <th className="px-4 py-3 font-semibold">Description</th>
                        <th className="px-4 py-3 font-semibold">Priorité</th>
                        <th className="px-4 py-3 font-semibold">Statut</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">Chargement…</td></tr>
                    ) : missions.length === 0 ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                            <Wrench size={24} className="mx-auto mb-2 opacity-40" />
                            Aucune mission assignée
                        </td></tr>
                    ) : (
                        missions.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-[#1565C0]">{m.reference}</td>
                                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{m.demandeDescription}</td>
                                <td className="px-4 py-3 text-gray-600">{m.niveauPriorite}</td>
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
                                            <span className="text-gray-300 text-xs">—</span>
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
    )
}