import { useEffect, useState, useCallback } from 'react'
import api from '../../../api/axiosConfig'
import { FileText, Plus, Trash2, X, Save, Wrench } from 'lucide-react'

export default function MesRapports() {
    const [missions, setMissions] = useState([])
    const [pieces, setPieces] = useState([])
    const [piecesAccessibles, setPiecesAccessibles] = useState(true)
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')

    // Modale de rédaction
    const [modalOuvert, setModalOuvert] = useState(false)
    const [interventionCourante, setInterventionCourante] = useState(null)
    const [causePanne, setCausePanne] = useState('')
    const [observations, setObservations] = useState('')
    const [lignesPieces, setLignesPieces] = useState([])
    const [saving, setSaving] = useState(false)
    const [erreurModal, setErreurModal] = useState('')

    const charger = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const { data } = await api.get('/api/technicien/interventions')
            // On ne garde que les interventions TERMINEE (rapport à rédiger)
            setMissions(data.filter((m) => m.statut === 'TERMINEE'))
        } catch (e) {
            setErreur(e.response?.data?.erreur || 'Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { charger() }, [charger])

    // Charger les pièces (peut échouer si le technicien n'a pas accès — 403)
    useEffect(() => {
        api.get('/api/responsable/stock/pieces')
            .then((r) => { setPieces(r.data); setPiecesAccessibles(true) })
            .catch(() => setPiecesAccessibles(false))
    }, [])

    const ouvrirModal = (intervention) => {
        setInterventionCourante(intervention)
        setCausePanne('')
        setObservations('')
        setLignesPieces([])
        setErreurModal('')
        setModalOuvert(true)
    }

    const fermerModal = () => {
        setModalOuvert(false)
        setInterventionCourante(null)
    }

    const ajouterLignePiece = () => {
        setLignesPieces([...lignesPieces, { pieceId: pieces[0]?.id || '', quantite: 1 }])
    }

    const modifierLignePiece = (index, champ, valeur) => {
        const copie = [...lignesPieces]
        copie[index][champ] = valeur
        setLignesPieces(copie)
    }

    const supprimerLignePiece = (index) => {
        setLignesPieces(lignesPieces.filter((_, i) => i !== index))
    }

    const soumettre = async () => {
        setSaving(true)
        setErreurModal('')
        try {
            const payload = {
                interventionId: interventionCourante.id,
                causePanne: causePanne,
                observations: observations,
            }
            // On n ajoute les pièces que si elles sont remplies
            const piecesValides = lignesPieces
                .filter((l) => l.pieceId && l.quantite > 0)
                .map((l) => ({ pieceId: l.pieceId, quantite: Number(l.quantite) }))
            if (piecesValides.length > 0) {
                payload.piecesUtilisees = piecesValides
            }
            await api.post('/api/technicien/rapports', payload)
            fermerModal()
            charger()
        } catch (e) {
            const msg = e.response?.data?.erreur
                || (e.response?.data?.champs
                    ? Object.values(e.response.data.champs).join(', ')
                    : 'Erreur lors de la création du rapport')
            setErreurModal(msg)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <FileText size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">Mes rapports</h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">
                    Rédigez les rapports techniques de vos interventions terminées
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
                            <th className="px-4 py-3 text-left font-semibold">Référence</th>
                            <th className="px-4 py-3 text-left font-semibold">Description</th>
                            <th className="px-4 py-3 text-left font-semibold">Priorité</th>
                            <th className="px-4 py-3 text-right font-semibold">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-400">Chargement…</td></tr>
                        ) : missions.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-400">
                                <Wrench size={24} className="mx-auto mb-2 opacity-40" />
                                Aucune intervention terminée à documenter
                            </td></tr>
                        ) : (
                            missions.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#1B7A5A]">{m.reference}</td>
                                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{m.demandeDescription}</td>
                                    <td className="px-4 py-3 text-slate-600">{m.niveauPriorite}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => ouvrirModal(m)}
                                            className="inline-flex items-center gap-1.5 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            <Plus size={14} /> Rédiger le rapport
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modale de rédaction ── */}
            {modalOuvert && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                        {/* En-tête modale */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-slate-900 font-semibold text-lg">Rapport technique</h2>
                                <p className="text-slate-500 text-xs mt-0.5">
                                    Intervention {interventionCourante?.reference}
                                </p>
                            </div>
                            <button onClick={fermerModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Corps modale */}
                        <div className="px-6 py-4 space-y-4">
                            {erreurModal && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {erreurModal}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Cause de la panne <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={causePanne}
                                    onChange={(e) => setCausePanne(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                                    placeholder="Décrivez la cause identifiée…"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Observations</label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                                    placeholder="Remarques complémentaires…"
                                />
                            </div>

                            {/* Pièces utilisées */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Pièces utilisées</label>
                                    {piecesAccessibles && (
                                        <button
                                            onClick={ajouterLignePiece}
                                            className="inline-flex items-center gap-1 text-xs text-[#1B7A5A] border border-[#1B7A5A] rounded-lg px-2.5 py-1 hover:bg-green-50 transition-colors font-medium"
                                        >
                                            <Plus size={13} /> Ajouter
                                        </button>
                                    )}
                                </div>

                                {!piecesAccessibles ? (
                                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        Liste des pièces non accessible (droits insuffisants). Le rapport peut être créé sans pièces.
                                    </p>
                                ) : lignesPieces.length === 0 ? (
                                    <p className="text-xs text-slate-400">Aucune pièce ajoutée (optionnel).</p>
                                ) : (
                                    <div className="space-y-2">
                                        {lignesPieces.map((ligne, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <select
                                                    value={ligne.pieceId}
                                                    onChange={(e) => modifierLignePiece(index, 'pieceId', e.target.value)}
                                                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                                >
                                                    {pieces.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.nom} (stock : {p.stockDisponible})
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={ligne.quantite}
                                                    onChange={(e) => modifierLignePiece(index, 'quantite', e.target.value)}
                                                    className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                                                />
                                                <button
                                                    onClick={() => supprimerLignePiece(index)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pied modale */}
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
                            <button
                                onClick={fermerModal}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-100 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={soumettre}
                                disabled={saving || !causePanne}
                                className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                <Save size={16} />
                                {saving ? 'Enregistrement…' : 'Enregistrer le rapport'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}