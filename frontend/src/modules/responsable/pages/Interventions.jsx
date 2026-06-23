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
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1565C0]">Interventions</h1>
                    <p className="text-[#546E7A] text-sm mt-1">Gestion et affectation des interventions</p>
                </div>
                <button
                    onClick={() => navigate('/responsable/interventions/nouvelle')}
                    className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                    <Plus size={18} /> Nouvelle intervention
                </button>
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
                        <th className="px-4 py-3 font-semibold">Demande</th>
                        <th className="px-4 py-3 font-semibold">Technicien</th>
                        <th className="px-4 py-3 font-semibold">Priorité</th>
                        <th className="px-4 py-3 font-semibold">Statut</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">Chargement…</td></tr>
                    ) : interventions.length === 0 ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                            <Wrench size={24} className="mx-auto mb-2 opacity-40" />
                            Aucune intervention
                        </td></tr>
                    ) : (
                        interventions.map((i) => (
                            <tr key={i.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-[#1565C0]">{i.reference}</td>
                                <td className="px-4 py-3 text-gray-600">{i.demandeReference}</td>
                                <td className="px-4 py-3 text-gray-700">{i.technicienNom || '—'}</td>
                                <td className="px-4 py-3 text-gray-600">{i.niveauPriorite}</td>
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
    )
}