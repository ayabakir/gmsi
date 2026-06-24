// gmsi-mono/frontend/src/modules/connaissances/components/FicheCard.jsx
import { Tag, Wrench, Folder } from 'lucide-react'

function highlight(text, motCle) {
    if (!motCle || !text) return text
    const regex = new RegExp(`(${motCle})`, 'gi')
    return text.split(regex).map((part, i) =>
        regex.test(part)
            ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark>
            : part
    )
}

export default function FicheCard({ fiche, motCle, onClick }) {
    const extrait = fiche.solution?.length > 100
        ? fiche.solution.substring(0, 100) + '…'
        : fiche.solution

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-[#1B7A5A] transition-all"
        >
            {/* Titre */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-slate-900 font-semibold text-base leading-snug">
                    {highlight(fiche.typePanne, motCle)}
                </h3>
                {fiche.libelleCategorie && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-[#1B7A5A] whitespace-nowrap">
            <Folder size={11} />
                        {fiche.libelleCategorie}
          </span>
                )}
            </div>

            {/* Équipement */}
            {fiche.equipementCible && (
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                    <Wrench size={14} />
                    <span>{fiche.equipementCible}</span>
                </div>
            )}

            {/* Extrait solution */}
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {highlight(extrait, motCle)}
            </p>

            {/* Badges mots-clés */}
            {fiche.motsCles?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {fiche.motsCles.map(mc => (
                        <span key={mc} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-[#1B7A5A]">
              <Tag size={10} />
                            {mc}
            </span>
                    ))}
                </div>
            )}
        </div>
    )
}