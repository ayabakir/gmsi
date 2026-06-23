// gmsi-mono/frontend/src/modules/notifications/components/NotifBadge.jsx

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNonLues, getMesNotifications, marquerLue, marquerToutesLues }
    from '../api/notifications.api';
import NotifItem from './NotifItem';

const POLL_MS = 30_000;

export default function NotifBadge() {
    const [count,   setCount]   = useState(0);
    const [notifs,  setNotifs]  = useState([]);
    const [open,    setOpen]    = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef           = useRef(null);
    const navigate              = useNavigate();

    // ── fetchCount — utilisé dans l'effet de polling ─────────────────────
    const fetchCount = useCallback(() => {
        getNonLues()
            .then(data => setCount(data.count ?? 0))
            .catch(() => {});
    }, []);

    // ── Polling toutes les 30s ────────────────────────────────────────────
    useEffect(() => {
        const timeout = setTimeout(fetchCount, 0);
        const id = setInterval(fetchCount, POLL_MS);
        return () => {
            clearTimeout(timeout);
            clearInterval(id);
        };
    }, [fetchCount]);

    // ── Fermeture au clic extérieur ───────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setTimeout(() => setOpen(false), 0);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Ouverture/fermeture dropdown ──────────────────────────────────────
    const handleToggle = async () => {
        const next = !open;
        setOpen(next);
        if (next) {
            setLoading(true);
            try {
                const data = await getMesNotifications();
                setNotifs(Array.isArray(data) ? data.slice(0, 5) : []);
            } catch {
                setNotifs([]);
            } finally {
                setLoading(false);
            }
        }
    };

    // ── Marquer une notif lue ─────────────────────────────────────────────
    const handleMarquerLue = async (id) => {
        try {
            await marquerLue(id);
            setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
            setCount(prev => Math.max(0, prev - 1));
        } catch { /* silencieux */ }
    };

    // ── Tout marquer lu ───────────────────────────────────────────────────
    const handleToutLire = async (e) => {
        e.stopPropagation();
        try {
            await marquerToutesLues();
            setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
            setCount(0);
        } catch { /* silencieux */ }
    };

    return (
        <div className="relative" ref={dropdownRef}>

            {/* ── Bouton Bell ── */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={22} className="text-[#546E7A]" />
                {count > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1
                        bg-red-500 text-white text-[10px] font-bold rounded-full
                        flex items-center justify-center leading-none">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl
                    border border-gray-100 z-50 overflow-hidden">

                    {/* En-tête */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">
                                Notifications
                            </span>
                            {count > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold
                                    bg-[#1565C0] text-white rounded-full">
                                    {count}
                                </span>
                            )}
                        </div>
                        {count > 0 && (
                            <button
                                onClick={handleToutLire}
                                className="flex items-center gap-1 text-xs text-[#1565C0]
                                    hover:underline font-medium"
                            >
                                <CheckCheck size={13} />
                                Tout lire
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <div className="max-h-72 overflow-y-auto">
                        {loading ? (
                            <div className="space-y-1 p-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i}
                                         className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : notifs.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400">Aucune notification</p>
                            </div>
                        ) : (
                            notifs.map(n => (
                                <NotifItem
                                    key={n.id}
                                    notif={n}
                                    onClick={handleMarquerLue}
                                    compact
                                />
                            ))
                        )}
                    </div>

                    {/* Pied */}
                    <button
                        onClick={() => { setOpen(false); navigate('notifications'); }}
                        className="w-full flex items-center justify-center gap-1.5
                            py-3 text-xs font-medium text-[#1565C0]
                            border-t border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                        Voir toutes les notifications
                        <ArrowRight size={13} />
                    </button>
                </div>
            )}
        </div>
    );
}