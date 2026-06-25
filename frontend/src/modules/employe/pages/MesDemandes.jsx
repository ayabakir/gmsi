import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { Plus, FileText, CheckCircle, Star, X } from 'lucide-react'

const statutStyle = (statut) => {
    switch (statut) {
        case 'EN_ATTENTE': return 'bg-yellow-50 text-yellow-700'
        case 'ASSIGNEE':   return 'bg-blue-50 text-blue-700'
        case 'EN_COURS':   return 'bg-indigo-50 text-indigo-700'
        case 'TERMINEE':   return 'bg-green-50 text-green-700'
        case 'CLOTUREE':   return 'bg-gray-100 text-gray-600'
        case 'REJETEE':    return 'bg-red-50 text-red-700'
        default:           return 'bg-gray-100 text-gray-600'
    }
}

export default function MesDemandes() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')
    const navigate = useNavigate()

    // Modale clôture + évaluation
    const [modalOuvert, setModalOuvert] = useState(false)
    const [demandeCourante, setDemandeCourante] = useState(null)
    const [rapport, setRapport] = useState(null)
    const [signature, setSignature] = useState('')
    const [note, setNote] = useState(5)
    const [commentaire, setCommentaire] = useState('')
    const [etape, setEtape] = useState('cloture') // 'cloture' puis 'evaluation'
    const [saving, setSaving] = useState(false)
    const [erreurModal, setErreurModal] = useState('')

    const charger = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const { data } = await api.get('/api/employe/demandes')
            setDemandes(data)
        } catch (e) {
            setErreur(e.response?.data?.erreur || 'Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { charger() }, [charger])

    const ouvrirModal = async (demande) => {
        setDemandeCourante(demande)
        setSignature('')
        setNote(5)
        setCommentaire('')
        setEtape('cloture')
        setErreurModal('')
        setRapport(null)
        setModalOuvert(true)
        // Charger le rapport du technicien pour le lire avant de valider
        try {
            const { data } = await api.get(`/api/employe/rapports/intervention/${demande.interventionId}`)
            setRapport(data)
        } catch {
            setRapport(null)
        }
    }

    const fermerModal = () => {
        setModalOuvert(false)
        setDemandeCourante(null)
        setRapport(null)
    }

    const cloturer = async () => {
        setSaving(true)
        setErreurModal('')
        try {
            await api.put(
                `/api/employe/rapports/intervention/${demandeCourante.interventionId}/cloturer`,
                { signature }
            )
            // Passer à l étape évaluation
            setEtape('evaluation')
        } catch (e) {
            setErreurModal(e.response?.data?.erreur || 'Erreur lors de la clôture')
        } finally {
            setSaving(false)
        }
    }

    const evaluer = async () => {
        setSaving(true)
        setErreurModal('')
        try {
            await api.post('/api/employe/evaluations', {
                interventionId: demandeCourante.interventionId,
                note: Number(note),
                commentaire: commentaire,
            })
            fermerModal()
            charger()
        } catch (e) {
            setErreurModal(e.response?.data?.erreur || 'Erreur lors de l évaluation')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <FileText size={22} className="text-[#1B7A5A]" />
                            <h1 className="text-slate-900 font-semibold text-xl">Mes demandes</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-9">Suivi de vos déclarations de panne</p>
                    </div>
                    <button
                        onClick={() => navigate('/employe/demandes/nouvelle')}
                        className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus size={18} /> Nouvelle demande
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
                            <th className="px-4 py-3 text-left font-semibold">Description</th>
                            <th className="px-4 py-3 text-left font-semibold">Équipement</th>
                            <th className="px-4 py-3 text-left font-semibold">Urgence</th>
                            <th className="px-4 py-3 text-left font-semibold">Statut</th>
                            <th className="px-4 py-3 text-right font-semibold">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">Chargement…</td></tr>
                        ) : demandes.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                                <FileText size={24} className="mx-auto mb-2 opacity-40" />
                                Aucune demande pour l'instant
                            </td></tr>
                        ) : (
                            demandes.map((d) => (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#1B7A5A]">{d.reference}</td>
                                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{d.description}</td>
                                    <td className="px-4 py-3 text-slate-600">{d.equipementNom}</td>
                                    <td className="px-4 py-3 text-slate-600">{d.niveauUrgence}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statutStyle(d.statut)}`}>
                                            {d.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {d.statut === 'TERMINEE' ? (
                                            <button
                                                onClick={() => ouvrirModal(d)}
                                                className="inline-flex items-center gap-1.5 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <CheckCircle size={14} /> Clôturer & évaluer
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

            {/* ── Modale clôture + évaluation ── */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-slate-900 font-semibold text-lg">
                                    {etape === 'cloture' ? 'Valider la clôture' : 'Évaluer l intervention'}
                                </h2>
                                <p className="text-slate-500 text-xs mt-0.5">{demandeCourante?.reference}</p>
                            </div>
                            <button onClick={fermerModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            {erreurModal && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {erreurModal}
                                </div>
                            )}

                            {/* ÉTAPE 1 : Clôture */}
                            {etape === 'cloture' && (
                                <>
                                    {/* Rapport du technicien (lecture) */}
                                    {rapport ? (
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                            <p className="text-xs font-semibold text-slate-500 uppercase">Rapport du technicien</p>
                                            <div>
                                                <p className="text-xs text-slate-400">Cause de la panne</p>
                                                <p className="text-sm text-slate-700">{rapport.causePanne}</p>
                                            </div>
                                            {rapport.observations && (
                                                <div>
                                                    <p className="text-xs text-slate-400">Observations</p>
                                                    <p className="text-sm text-slate-700">{rapport.observations}</p>
                                                </div>
                                            )}
                                            {rapport.piecesUtilisees?.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-slate-400">Pièces utilisées</p>
                                                    <ul className="text-sm text-slate-700 list-disc list-inside">
                                                        {rapport.piecesUtilisees.map((p, i) => (
                                                            <li key={i}>{p.nomPiece} × {p.quantite}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400">Rapport non disponible.</p>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Signature <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={signature}
                                            onChange={(e) => setSignature(e.target.value)}
                                            placeholder="Tapez votre nom pour valider"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                                        />
                                    </div>
                                </>
                            )}

                            {/* ÉTAPE 2 : Évaluation */}
                            {etape === 'evaluation' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button key={n} onClick={() => setNote(n)} type="button">
                                                    <Star
                                                        size={28}
                                                        className={n <= note ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ml-2 text-sm text-slate-500">{note} / 5</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Commentaire</label>
                                        <textarea
                                            value={commentaire}
                                            onChange={(e) => setCommentaire(e.target.value)}
                                            rows={3}
                                            placeholder="Votre retour sur l intervention…"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
                            <button
                                onClick={fermerModal}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-100 transition-colors"
                            >
                                Annuler
                            </button>
                            {etape === 'cloture' ? (
                                <button
                                    onClick={cloturer}
                                    disabled={saving || !signature}
                                    className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                    {saving ? 'Validation…' : 'Valider la clôture'}
                                </button>
                            ) : (
                                <button
                                    onClick={evaluer}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                    {saving ? 'Envoi…' : 'Envoyer l évaluation'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}