// frontend/src/modules/administration/components/ParametreRow.jsx
import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import { libelleParametre, estCoefficient } from '../utils/labelsParametres'

/**
 * Ligne éditable d'un paramètre système.
 * - Libellé humain + sous-titre de contexte (clé technique en mono, discrète)
 * - Édition inline de la valeur, densité compacte
 * - Bouton "Enregistrer" visible seulement si la valeur a changé
 * - Badge "coeff" + confirmation modale pour les clés COEFF_*
 */
export default function ParametreRow({ parametre, onSauvegarder }) {
    const [valeur, setValeur] = useState(parametre.valeur)
    const [enregistrement, setEnregistrement] = useState(false)
    const [confirmationOuverte, setConfirmationOuverte] = useState(false)

    const valeurModifiee = valeur !== parametre.valeur
    const estCoeff = estCoefficient(parametre.cle)
    const { titre, sousTitre } = libelleParametre(parametre.cle)

    const lancerSauvegarde = () => {
        if (estCoeff) {
            setConfirmationOuverte(true)
            return
        }
        sauvegarder()
    }

    const sauvegarder = async () => {
        setConfirmationOuverte(false)
        setEnregistrement(true)
        try {
            await onSauvegarder(parametre.cle, valeur)
        } finally {
            setEnregistrement(false)
        }
    }

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{titre}</span>
                        {estCoeff && (
                            <span
                                title="Modifier ce coefficient recalculera les scores de tous les techniciens"
                                className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 cursor-help"
                            >
                                coeff
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono">{parametre.cle.toLowerCase()}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">{sousTitre}</span>
                    </div>
                </td>
                <td className="px-4 py-2.5">
                    <input
                        type="text"
                        value={valeur}
                        onChange={(e) => setValeur(e.target.value)}
                        className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-mono text-right focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    />
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-500">
                    {parametre.dateModification
                        ? new Date(parametre.dateModification).toLocaleString('fr-FR')
                        : '—'}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-500">
                    {parametre.emailModifiePar || '—'}
                </td>
                <td className="px-4 py-2.5 text-right">
                    {valeurModifiee && (
                        <button
                            onClick={lancerSauvegarde}
                            disabled={enregistrement}
                            className="inline-flex items-center gap-1.5 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-1.5 px-3 rounded-lg transition-colors text-xs disabled:opacity-60"
                        >
                            <Save size={14} />
                            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    )}
                </td>
            </tr>

            {confirmationOuverte && (
                <tr>
                    <td colSpan={5} className="p-0">
                        <div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                            onClick={() => setConfirmationOuverte(false)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-sm p-6 max-w-sm w-full mx-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="bg-amber-50 text-amber-700 rounded-full p-2 shrink-0">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 text-sm">
                                            Recalcul des scores
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Cette action recalculera tous les scores. Continuer ?
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setConfirmationOuverte(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={sauvegarder}
                                        className="bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                    >
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}