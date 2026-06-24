// gmsi-mono/frontend/src/modules/connaissances/components/FicheDetailModal.jsx
import { X, Tag, Wrench, FileText, Calendar } from 'lucide-react'

export default function FicheDetailModal({ fiche, onClose }) {
    if (!fiche) return null

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <div className="flex-1 pr-4">
                        <h2 className="text-slate-900 font-semibold text-lg leading-snug">
                            {fiche.typePanne}
                        </h2>
                        {fiche.equipementCible && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                                <Wrench size={14} />
                                <span>{fiche.equipementCible}</span>
                                {fiche.libelleCategorie && (
                                    <span className="text-slate-400">· {fiche.libelleCategorie}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Corps */}
                <div className="p-6 space-y-5">

                    {/* Solution */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Solution
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed bg-green-50 rounded-lg p-4 border border-green-100">
                            {fiche.solution}
                        </p>
                    </div>

                    {/* Mots-clés */}
                    {fiche.motsCles?.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Mots-clés
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {fiche.motsCles.map(mc => (
                                    <span key={mc} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-[#1B7A5A]">
                    <Tag size={10} />
                                        {mc}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                        {fiche.refRapportSource && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                <FileText size={14} />
                                <span>Rapport : <span className="font-medium text-slate-700">{fiche.refRapportSource}</span></span>
                            </div>
                        )}
                        {fiche.dateCreation && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                <Calendar size={14} />
                                <span>Créée le : <span className="font-medium text-slate-700">
                  {new Date(fiche.dateCreation).toLocaleDateString('fr-FR')}
                </span></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}