// gmsi-mono/frontend/src/modules/notifications/components/NotifItem.jsx

import React from 'react';
import { Mail, Bell } from 'lucide-react';

/**
 * Formate une date en texte relatif français sans dépendance externe.
 * Ex: "Il y a 2 heures", "Il y a 3 jours"
 */
function formatRelative(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);

    if (minutes < 1)  return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24)   return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 30)    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function NotifItem({ notif, onClick, compact = false }) {
    const isEmail = notif.type === 'EMAIL';

    return (
        <div
            onClick={() => !notif.lu && onClick && onClick(notif.id)}
            className={`
        flex items-start gap-3 px-4 py-3 transition-all cursor-pointer
        ${notif.lu
                ? 'bg-white hover:bg-gray-50'
                : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-[#1565C0]'
            }
        ${compact ? 'rounded-lg' : 'border-b border-gray-100 last:border-0'}
      `}
        >
            {/* Icône type */}
            <div className={`
        mt-0.5 flex-shrink-0 p-1.5 rounded-full
        ${notif.lu ? 'bg-gray-100 text-[#546E7A]' : 'bg-blue-100 text-[#1565C0]'}
      `}>
                {isEmail
                    ? <Mail size={14} />
                    : <Bell size={14} />
                }
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug line-clamp-2
          ${notif.lu ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {notif.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#546E7A]">
            {formatRelative(notif.dateEnvoi)}
          </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
            ${notif.lu
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-100 text-[#1565C0]'
                    }`}>
            {notif.lu ? 'Lu' : 'Non lu'}
          </span>
                </div>
            </div>

            {/* Pastille non lue */}
            {!notif.lu && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#1565C0] mt-2" />
            )}
        </div>
    );
}