import { useEffect, useState, useCallback } from 'react'
import api from '../../../api/axiosConfig'
import { Check, X, FileText } from 'lucide-react'

const STATUTS = ['', 'EN_ATTENTE', 'ASSIGNEE', 'EN_COURS', 'TERMINEE', 'REJETEE']

const statutStyle = (statut) => {
    switch (statut) {
        case 'EN_ATTENTE': return 'bg-yellow-50 text-yellow-700'
        case 'ASSIGNEE':   return 'bg-blue-50 text-blue-700'
        case 'EN_COURS':   return 'bg-indigo-50 text-indigo-700'
        case 'TERMINEE':   return 'bg-green-50 text-green-700'
        case 'REJETEE':    return 'bg-red-50 text-red-700'
        default:           return 'bg-gray-100 text-gray-600'
    }
}

export default function DemandesResponsable() {
    const [demandes, setDemandes] = useState([])
    const [filtreStatut, setFiltreStatut] = useState('')
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')

    const charger = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const url = filtreStatut
                ? `/api/responsable/demandes?statut=${filtreStatut}`
                : '/api/responsable/demandes'
            const { data } = await api.get(url)
            setDemandes(data)
        } catch (e) {
            setErreur(e.response?.data?.erreur || "Erreur lors du chargement")
        } finally {
            setLoading(false)
        }
    }, [filtreStatut])

    useEffect(() => { charger() }, [charger])

    const valider = async (d) => {
        if (!window.confirm(`Valider la demande ${d.reference} ?`)) return
        try {
            await api.put(`/api/responsable/demandes/${d.id}/valider`)
            charger()
        } catch (e) {
            setErreur(e.response?.data?.erreur || "Erreur lors de la validation")
        }
    }

    const rejeter = async (d) => {
        const motif = window.prompt(`Motif du rejet de ${d.reference} :`)
        if (!motif) return
        try {
            await api.put(`/api/responsable/demandes/${d.id}/rejeter`, { motif })
            charger()
        } catch (e) {
            setErreur(e.response?.data?.erreur || "Erreur lors du rejet")
        }
    }

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <FileText size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Demandes d'intervention</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">Validez ou rejetez les demandes des employés</p>
            </div>

            {/* ── Filtre par statut ── */}
            <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600 font-medium">Filtrer par statut :</label>
                <select
                    value={filtreStatut}
                    onChange={(e) => setFiltreStatut(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                >
                    {STATUTS.map((s) => (
                        <option key={s} value={s}>{s === '' ? 'Tous' : s}</option>
                    ))}
                </select>
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
                            <th className="px-4 py-3 text-left font-semibold">Employé</th>
                            <th className="px-4 py-3 text-left font-semibold">Équipement</th>
                            <th className="px-4 py-3 text-left font-semibold">Urgence</th>
                            <th className="px-4 py-3 text-left font-semibold">Statut</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">Chargement…</td></tr>
                        ) : demandes.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                                <FileText size={24} className="mx-auto mb-2 opacity-40" />
                                Aucune demande
                            </td></tr>
                        ) : (
                            demandes.map((d) => (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#1B7A5A]">{d.reference}</td>
                                    <td className="px-4 py-3 text-slate-700">{d.employeNom}</td>
                                    <td className="px-4 py-3 text-slate-600">{d.equipementNom}</td>
                                    <td className="px-4 py-3 text-slate-600">{d.niveauUrgence}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statutStyle(d.statut)}`}>
                                            {d.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {d.statut === 'EN_ATTENTE' ? (
                                                <>
                                                    <button
                                                        onClick={() => valider(d)}
                                                        title="Valider"
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => rejeter(d)}
                                                        title="Rejeter"
                                                        className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : (
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