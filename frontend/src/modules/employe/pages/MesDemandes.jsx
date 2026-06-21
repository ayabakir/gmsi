import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { Plus, FileText } from 'lucide-react'

// Couleur du badge selon le statut
const statutStyle = (statut) => {
    switch (statut) {
        case 'EN_ATTENTE': return 'bg-yellow-50 text-yellow-700'
        case 'ASSIGNEE':   return 'bg-blue-50 text-[#1565C0]'
        case 'EN_COURS':   return 'bg-indigo-50 text-indigo-700'
        case 'TERMINEE':   return 'bg-green-50 text-green-700'
        case 'REJETEE':    return 'bg-red-50 text-red-700'
        default:           return 'bg-gray-100 text-gray-600'
    }
}

export default function MesDemandes() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')
    const navigate = useNavigate()

    const charger = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const { data } = await api.get('/api/employe/demandes')
            setDemandes(data)
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
                    <h1 className="text-2xl font-bold text-[#1565C0]">Mes demandes</h1>
                    <p className="text-[#546E7A] text-sm mt-1">Suivi de vos déclarations de panne</p>
                </div>
                <button
                    onClick={() => navigate('/employe/demandes/nouvelle')}
                    className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                    <Plus size={18} /> Nouvelle demande
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
                        <th className="px-4 py-3 font-semibold">Description</th>
                        <th className="px-4 py-3 font-semibold">Équipement</th>
                        <th className="px-4 py-3 font-semibold">Urgence</th>
                        <th className="px-4 py-3 font-semibold">Statut</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">Chargement…</td></tr>
                    ) : demandes.length === 0 ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                            <FileText size={24} className="mx-auto mb-2 opacity-40" />
                            Aucune demande pour l'instant
                        </td></tr>
                    ) : (
                        demandes.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-[#1565C0]">{d.reference}</td>
                                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{d.description}</td>
                                <td className="px-4 py-3 text-gray-600">{d.equipementNom}</td>
                                <td className="px-4 py-3 text-gray-600">{d.niveauUrgence}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statutStyle(d.statut)}`}>
                                        {d.statut}
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