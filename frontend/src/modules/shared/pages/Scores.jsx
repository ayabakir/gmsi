import { useEffect, useState } from 'react'
import api from '../../../api/axiosConfig'
import { Award, Star, X } from 'lucide-react'

export default function Scores() {
    const [scores, setScores] = useState([])
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')

    // Modale évaluations détaillées
    const [modalOuvert, setModalOuvert] = useState(false)
    const [technicienCourant, setTechnicienCourant] = useState(null)
    const [evaluations, setEvaluations] = useState([])
    const [loadingEval, setLoadingEval] = useState(false)

    useEffect(() => {
        const charger = async () => {
            setLoading(true)
            setErreur('')
            try {
                // 1. Récupérer les techniciens
                const { data: techniciens } = await api.get('/api/admin/users?role=TECHNICIEN')
                // 2. Pour chacun, récupérer son score
                const resultats = await Promise.all(
                    techniciens.map(async (t) => {
                        try {
                            const { data } = await api.get(`/api/scores/technicien/${t.id}`)
                            return data
                        } catch {
                            // Pas encore de score (aucune évaluation)
                            return {
                                technicienId: t.id,
                                technicienNom: `${t.prenom} ${t.nom}`,
                                scorePondere: null,
                                noteBruteMoyenne: null,
                                nbEvaluations: 0,
                                dateCalcul: null,
                            }
                        }
                    })
                )
                setScores(resultats)
            } catch (e) {
                setErreur(e.response?.data?.erreur || 'Erreur lors du chargement des scores')
            } finally {
                setLoading(false)
            }
        }
        charger()
    }, [])

    const voirEvaluations = async (score) => {
        setTechnicienCourant(score)
        setModalOuvert(true)
        setLoadingEval(true)
        try {
            const { data } = await api.get(`/api/scores/technicien/${score.technicienId}/evaluations`)
            setEvaluations(data)
        } catch {
            setEvaluations([])
        } finally {
            setLoadingEval(false)
        }
    }

    const fermerModal = () => {
        setModalOuvert(false)
        setTechnicienCourant(null)
        setEvaluations([])
    }

    // Couleur du score selon sa valeur
    const couleurScore = (score) => {
        if (score === null) return 'text-slate-400'
        if (score >= 4) return 'text-green-600'
        if (score >= 2.5) return 'text-amber-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <Award size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Scores des techniciens</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">
                    Performance pondérée par la difficulté des interventions
                </p>
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
                            <th className="px-4 py-3 text-left font-semibold">Technicien</th>
                            <th className="px-4 py-3 text-left font-semibold">Score pondéré</th>
                            <th className="px-4 py-3 text-left font-semibold">Note brute moyenne</th>
                            <th className="px-4 py-3 text-left font-semibold">Évaluations</th>
                            <th className="px-4 py-3 text-right font-semibold">Détail</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">Chargement…</td></tr>
                        ) : scores.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                                <Award size={24} className="mx-auto mb-2 opacity-40" />
                                Aucun technicien
                            </td></tr>
                        ) : (
                            scores.map((s) => (
                                <tr key={s.technicienId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{s.technicienNom}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-lg font-bold ${couleurScore(s.scorePondere)}`}>
                                            {s.scorePondere !== null ? Number(s.scorePondere).toFixed(2) : '—'}
                                        </span>
                                        <span className="text-slate-400 text-xs"> / 5</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {s.noteBruteMoyenne !== null ? Number(s.noteBruteMoyenne).toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-[#1B7A5A]">
                                            {s.nbEvaluations}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {s.nbEvaluations > 0 ? (
                                            <button
                                                onClick={() => voirEvaluations(s)}
                                                className="text-xs text-[#1B7A5A] font-medium hover:underline"
                                            >
                                                Voir les évaluations
                                            </button>
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modale évaluations ── */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-slate-900 font-semibold text-lg">Évaluations reçues</h2>
                                <p className="text-slate-500 text-xs mt-0.5">{technicienCourant?.technicienNom}</p>
                            </div>
                            <button onClick={fermerModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-3">
                            {loadingEval ? (
                                <p className="text-center text-slate-400 text-sm py-6">Chargement…</p>
                            ) : evaluations.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-6">Aucune évaluation</p>
                            ) : (
                                evaluations.map((ev) => (
                                    <div key={ev.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-slate-700 text-sm">{ev.interventionReference}</span>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        size={14}
                                                        className={n <= ev.note ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {ev.niveauDifficulte}
                                            </span>
                                        </div>
                                        {ev.commentaire && (
                                            <p className="text-slate-600 text-sm mt-1">{ev.commentaire}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}