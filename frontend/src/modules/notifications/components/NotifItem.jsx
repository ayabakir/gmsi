// src/modules/notifications/components/NotifItem.jsx
import { Check } from 'lucide-react';

const TYPE_STYLES = {
    DEMANDE_RECUE:              { dot: 'bg-blue-400',    label: 'Demande reçue',         bg: 'bg-blue-50'   },
    DEMANDE_ASSIGNEE:           { dot: 'bg-indigo-400',  label: 'Demande assignée',       bg: 'bg-indigo-50' },
    DEMANDE_REJETEE:            { dot: 'bg-red-400',     label: 'Demande rejetée',        bg: 'bg-red-50'    },
    MISSION_AFFECTEE:           { dot: 'bg-purple-400',  label: 'Mission affectée',       bg: 'bg-purple-50' },
    FIN_INTERVENTION:           { dot: 'bg-[#1B7A5A]',  label: 'Fin intervention',       bg: 'bg-green-50'  },
    EVALUATION_RECUE:           { dot: 'bg-yellow-400',  label: 'Évaluation reçue',       bg: 'bg-yellow-50' },
    SEUIL_STOCK_BAS:            { dot: 'bg-orange-400',  label: 'Stock bas',              bg: 'bg-orange-50' },
    COMPTE_DESACTIVE:           { dot: 'bg-gray-400',    label: 'Compte désactivé',       bg: 'bg-gray-50'   },
    DEMANDE_A_TRAITER:          { dot: 'bg-cyan-400',    label: 'À traiter',              bg: 'bg-cyan-50'   },
    INTERVENTION_DEMARREE:      { dot: 'bg-teal-400',    label: 'Intervention démarrée',  bg: 'bg-teal-50'   },
    INTERVENTION_TERMINEE_RESP: { dot: 'bg-emerald-500', label: 'Intervention terminée',  bg: 'bg-emerald-50'},
};

const DEFAULT_STYLE = { dot: 'bg-gray-300', label: 'Notification', bg: 'bg-gray-50' };

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diffMin = Math.floor((new Date() - d) / 60000);
    if (diffMin < 1)  return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7)    return `Il y a ${diffD}j`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function NotifItem({ notif, onMarquerLue }) {
    const style   = TYPE_STYLES[notif.type] ?? DEFAULT_STYLE;
    const isUnread = !notif.lue;

    return (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-sm
                     ${isUnread
            ? `${style.bg} border-l-4 border-l-[#1B7A5A] border-t-gray-100 border-r-gray-100 border-b-gray-100`
            : 'bg-white border-gray-100'}`}>

            <div className="mt-1.5 flex-shrink-0">
                <span className={`inline-block w-2 h-2 rounded-full ${style.dot}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg
                            ${isUnread
              ? 'bg-[#1B7A5A] text-white'
              : 'bg-gray-100 text-gray-500'}`}>
            {style.label}
          </span>
                    {isUnread && (
                        <span className="text-xs font-semibold text-[#1B7A5A]">Nouveau</span>
                    )}
                </div>
                <p className={`text-sm ${isUnread ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                    {notif.message}
                </p>
                <span className="text-xs text-gray-400 mt-1 block">{formatDate(notif.dateEnvoi)}</span>
            </div>

            {isUnread && (
                <button
                    onClick={() => onMarquerLue(notif.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[#1B7A5A] hover:text-white
                     text-[#1B7A5A] border border-[#1B7A5A] transition-colors"
                    title="Marquer comme lue"
                >
                    <Check size={13} />
                </button>
            )}
        </div>
    );
}