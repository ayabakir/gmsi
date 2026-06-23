// gmsi-mono/frontend/src/modules/notifications/pages/Notifications.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Mail, Wifi } from 'lucide-react';
import {
    getMesNotifications,
    marquerLue,
    marquerToutesLues,
} from '../api/notifications.api';
import NotifItem from '../components/NotifItem';

const PAGE_SIZE = 10;

// ── Icône selon le type de notif ──────────────────────────────────────────
function TypeBadge({ type }) {
    return type === 'EMAIL'
        ? <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5
        rounded-full bg-blue-50 text-[#1565C0] font-medium">
        <Mail size={10} /> Email
      </span>
        : <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5
        rounded-full bg-purple-50 text-purple-600 font-medium">
        <Wifi size={10} /> Push
      </span>;
}

export default function Notifications() {
    const [notifs,  setNotifs]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur,  setErreur]  = useState(null);
    const [filtre,  setFiltre]  = useState('TOUTES'); // 'TOUTES' | 'NON_LUES' | 'LUES'
    const [page,    setPage]    = useState(1);

    // ── Chargement ──────────────────────────────────────────────────────────
    const charger = useCallback(async () => {
        setLoading(true);
        setErreur(null);
        try {
            const data = await getMesNotifications();
            setNotifs(data);
        } catch {
            setErreur('Impossible de charger les notifications.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    // ── Marquer une lue ─────────────────────────────────────────────────────
    const handleMarquerLue = async (id) => {
        try {
            await marquerLue(id);
            setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
        } catch { /* silencieux */ }
    };

    // ── Tout marquer lu ─────────────────────────────────────────────────────
    const handleToutLire = async () => {
        try {
            await marquerToutesLues();
            setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
        } catch { /* silencieux */ }
    };

    // ── Filtrage + pagination côté client ───────────────────────────────────
    const notifsFiltrées = notifs.filter(n => {
        if (filtre === 'NON_LUES') return !n.lu;
        if (filtre === 'LUES')     return n.lu;
        return true;
    });

    const totalPages   = Math.max(1, Math.ceil(notifsFiltrées.length / PAGE_SIZE));
    const notifsPage   = notifsFiltrées.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const nonLuesCount = notifs.filter(n => !n.lu).length;

    const handleFiltre = (f) => { setFiltre(f); setPage(1); };

    // ── Squelette de chargement ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
                <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-6" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">

            {/* ── En-tête ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Bell size={20} className="text-[#1565C0]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800">
                            Mes notifications
                        </h1>
                        <p className="text-xs text-[#546E7A]">
                            {notifs.length} au total
                            {nonLuesCount > 0 && ` · ${nonLuesCount} non lue${nonLuesCount > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                {nonLuesCount > 0 && (
                    <button
                        onClick={handleToutLire}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
              text-[#1565C0] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <CheckCheck size={15} />
                        Tout marquer lu
                    </button>
                )}
            </div>

            {/* ── Erreur ── */}
            {erreur && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100
          rounded-xl text-sm text-red-600">
                    {erreur}
                </div>
            )}

            {/* ── Filtres ── */}
            <div className="flex gap-2 mb-5">
                {[
                    { key: 'TOUTES',   label: 'Toutes',   count: notifs.length },
                    { key: 'NON_LUES', label: 'Non lues', count: nonLuesCount },
                    { key: 'LUES',     label: 'Lues',     count: notifs.length - nonLuesCount },
                ].map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => handleFiltre(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
              text-sm font-medium transition-colors
              ${filtre === key
                            ? 'bg-[#1565C0] text-white'
                            : 'bg-gray-100 text-[#546E7A] hover:bg-gray-200'
                        }`}
                    >
                        {label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
              ${filtre === key ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
              {count}
            </span>
                    </button>
                ))}
            </div>

            {/* ── Liste ── */}
            {notifsPage.length === 0 ? (
                <div className="text-center py-16 text-[#546E7A]">
                    <Bell size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Aucune notification</p>
                    <p className="text-xs mt-1 text-gray-400">
                        {filtre === 'NON_LUES'
                            ? 'Tout est lu — bien joué !'
                            : 'Les notifications apparaîtront ici.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    {notifsPage.map(n => (
                        <NotifItem key={n.id} notif={n} onClick={handleMarquerLue} />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-200
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-50 transition-colors font-medium text-gray-600"
                    >
                        ← Précédent
                    </button>
                    <span className="text-sm text-[#546E7A]">
            {page} / {totalPages}
          </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-200
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-50 transition-colors font-medium text-gray-600"
                    >
                        Suivant →
                    </button>
                </div>
            )}
        </div>
    );
}