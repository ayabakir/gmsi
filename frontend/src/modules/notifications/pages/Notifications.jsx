// src/modules/notifications/pages/Notifications.jsx
import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, RefreshCw, Settings, X, Plus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import NotifItem from '../components/NotifItem';
import {
    getMesNotifications,
    marquerLue,
    marquerToutLire,
    updatePreferencesNotif,
    getTemplates,
    createTemplate,
} from '../api/notifications.api';

const PREFERENCES = ['EMAIL', 'PUSH', 'LES_DEUX'];
const PREF_LABELS  = { EMAIL: 'Email', PUSH: 'Push', LES_DEUX: 'Email + Push' };

const CODES_TEMPLATES = [
    'DEMANDE_RECUE','DEMANDE_ASSIGNEE','DEMANDE_REJETEE',
    'MISSION_AFFECTEE','FIN_INTERVENTION','EVALUATION_RECUE',
    'SEUIL_STOCK_BAS','COMPTE_DESACTIVE','DEMANDE_A_TRAITER',
    'INTERVENTION_DEMARREE','INTERVENTION_TERMINEE_RESP',
];

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3
                     rounded-xl shadow-lg text-white text-sm font-medium
                     ${type === 'success' ? 'bg-[#1B7A5A]' : 'bg-red-600'}`}>
            {message}
            <button onClick={onClose}><X size={16} /></button>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 animate-pulse border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Notifications() {
    const { user } = useAuth();
    const isAdmin  = user?.role === 'ADMIN';

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [erreur, setErreur]               = useState(null);
    const [toast, setToast]                 = useState(null);
    const [filtre, setFiltre]               = useState('TOUS');

    const [showPref, setShowPref]     = useState(false);
    const [preference, setPreference] = useState('EMAIL');
    const [savingPref, setSavingPref] = useState(false);

    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates]         = useState([]);
    const [loadingTpl, setLoadingTpl]       = useState(false);
    // ✅ type ajouté dans l'état initial
    const [newTpl, setNewTpl] = useState({
        code:  CODES_TEMPLATES[0],
        sujet: '',
        corps: '',
        type:  'EMAIL',
    });
    const [savingTpl, setSavingTpl] = useState(false);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const fetchNotifications = useCallback(() => {
        setLoading(true);
        setErreur(null);
        getMesNotifications()
            .then(data => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => setErreur('Impossible de charger les notifications.'))
            .finally(() => setLoading(false));
    }, []);

    const fetchTemplates = useCallback(() => {
        if (!isAdmin) return;
        setLoadingTpl(true);
        getTemplates()
            .then(data => setTemplates(Array.isArray(data) ? data : []))
            .catch(() => showToast('Impossible de charger les templates.', 'error'))
            .finally(() => setLoadingTpl(false));
    }, [isAdmin, showToast]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
    useEffect(() => { if (showTemplates) fetchTemplates(); }, [showTemplates, fetchTemplates]);

    const handleMarquerLue = (id) => {
        marquerLue(id)
            .then(() => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
                showToast('Notification marquée comme lue.');
            })
            .catch(() => showToast('Erreur lors de la mise à jour.', 'error'));
    };

    const handleToutLire = () => {
        marquerToutLire()
            .then(() => {
                setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
                showToast('Toutes les notifications marquées comme lues.');
            })
            .catch(() => showToast('Erreur lors de la mise à jour.', 'error'));
    };

    const handleSavePref = () => {
        setSavingPref(true);
        updatePreferencesNotif(preference)
            .then(() => { showToast('Préférences enregistrées.'); setShowPref(false); })
            .catch(() => showToast('Erreur lors de la sauvegarde.', 'error'))
            .finally(() => setSavingPref(false));
    };

    const handleCreateTemplate = () => {
        if (!newTpl.sujet.trim() || !newTpl.corps.trim()) {
            showToast('Sujet et corps sont obligatoires.', 'error');
            return;
        }
        setSavingTpl(true);
        createTemplate(newTpl)
            .then(created => {
                setTemplates(prev => [...prev, created]);
                setNewTpl({ code: CODES_TEMPLATES[0], sujet: '', corps: '', type: 'EMAIL' });
                showToast('Template créé avec succès.');
            })
            .catch(() => showToast('Erreur lors de la création.', 'error'))
            .finally(() => setSavingTpl(false));
    };

    // ✅ Utilise n.lu (vrai nom colonne BDD)
    const notifsFiltrees = notifications.filter(n => {
        if (filtre === 'NON_LUES') return !n.lu;
        if (filtre === 'LUES')     return n.lu;
        return true;
    });
    const nonLuesCount = notifications.filter(n => !n.lu).length;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <div className="max-w-4xl mx-auto space-y-5">

                {/* ── En-tête ── */}
                <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Bell size={20} className="text-[#1B7A5A]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">Notifications</h1>
                                <p className="text-sm text-gray-500">
                                    {nonLuesCount > 0
                                        ? `${nonLuesCount} non lue${nonLuesCount > 1 ? 's' : ''}`
                                        : 'Tout est à jour'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={fetchNotifications}
                                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                                           text-gray-500 transition-colors"
                                title="Rafraîchir"
                            >
                                <RefreshCw size={15} />
                            </button>

                            {nonLuesCount > 0 && (
                                <button
                                    onClick={handleToutLire}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1B7A5A]
                                               text-[#1B7A5A] bg-white text-sm font-medium hover:bg-green-50 transition-colors"
                                >
                                    <CheckCheck size={15} />
                                    Tout lire
                                </button>
                            )}

                            <button
                                onClick={() => setShowPref(!showPref)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B7A5A]
                                           text-white text-sm font-medium hover:bg-[#15634A] transition-colors"
                            >
                                <Settings size={15} />
                                Préférences
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200
                                               text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <Plus size={15} />
                                    Templates
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Préférences ── */}
                {showPref && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Préférences de notification</h2>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {PREFERENCES.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPreference(p)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors
                                               ${preference === p
                                        ? 'bg-[#1B7A5A] text-white border-[#1B7A5A]'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {PREF_LABELS[p]}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowPref(false)}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSavePref}
                                disabled={savingPref}
                                className="px-4 py-2 rounded-xl bg-[#1B7A5A] text-white text-sm font-medium
                                           hover:bg-[#15634A] disabled:opacity-60 transition-colors"
                            >
                                {savingPref ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Templates ADMIN ── */}
                {isAdmin && showTemplates && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-700">Gestion des templates</h2>

                        {/* Formulaire — seulement si un code libre existe */}
                        {(() => {
                            const codesExistants = templates.map(t => t.code)
                            const codesLibres = CODES_TEMPLATES.filter(c => !codesExistants.includes(c))

                            if (codesLibres.length === 0) return (
                                <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        ✅ Tous les templates sont déjà configurés.
                                    </p>
                                </div>
                            )

                            return (
                                <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Nouveau template ({codesLibres.length} code{codesLibres.length > 1 ? 's' : ''} disponible{codesLibres.length > 1 ? 's' : ''})
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Code</label>
                                            <select
                                                value={newTpl.code}
                                                onChange={e => setNewTpl(p => ({ ...p, code: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800
                                           focus:outline-none focus:ring-2 focus:ring-[#1B7A5A]"
                                            >
                                                {codesLibres.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Sujet</label>
                                            <input
                                                type="text"
                                                value={newTpl.sujet}
                                                onChange={e => setNewTpl(p => ({ ...p, sujet: e.target.value }))}
                                                placeholder="Sujet de la notification"
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                                           focus:outline-none focus:ring-2 focus:ring-[#1B7A5A]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Type</label>
                                            <select
                                                value={newTpl.type}
                                                onChange={e => setNewTpl(p => ({ ...p, type: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800
                                           focus:outline-none focus:ring-2 focus:ring-[#1B7A5A]"
                                            >
                                                <option value="EMAIL">Email</option>
                                                <option value="PUSH_WEB">Push Web</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Corps du message</label>
                                            <textarea
                                                value={newTpl.corps}
                                                onChange={e => setNewTpl(p => ({ ...p, corps: e.target.value }))}
                                                rows={3}
                                                placeholder="Contenu du template..."
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                                           focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleCreateTemplate}
                                            disabled={savingTpl}
                                            className="px-4 py-2 rounded-xl bg-[#1B7A5A] text-white text-sm font-medium
                                       hover:bg-[#15634A] disabled:opacity-60 transition-colors"
                                        >
                                            {savingTpl ? 'Création...' : 'Créer le template'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Liste templates existants */}
                        {loadingTpl ? (
                            <p className="text-sm text-gray-500 text-center py-4">Chargement...</p>
                        ) : templates.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Aucun template configuré.</p>
                        ) : (
                            <div className="space-y-2">
                                {templates.map((tpl, i) => (
                                    <div key={tpl.id ?? i} className="border border-gray-100 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#1B7A5A] bg-green-50 px-2 py-0.5 rounded-lg">
                                {tpl.code}
                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium
                                ${tpl.type === 'EMAIL'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-purple-50 text-purple-600'}`}>
                                {tpl.type === 'EMAIL' ? 'Email' : 'Push Web'}
                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{tpl.sujet}</p>
                                        <p className="text-xs text-gray-500 mt-1 font-mono">{tpl.corps}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Filtres ── */}
                <div className="flex gap-2">
                    {[
                        { key: 'TOUS',     label: `Tout (${notifications.length})` },
                        { key: 'NON_LUES', label: `Non lues (${nonLuesCount})` },
                        { key: 'LUES',     label: `Lues (${notifications.length - nonLuesCount})` },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFiltre(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                                        ${filtre === f.key
                                ? 'bg-[#1B7A5A] text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* ── Liste notifications ── */}
                {loading ? (
                    <Skeleton />
                ) : erreur ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <p className="text-red-600 font-medium">{erreur}</p>
                        <button
                            onClick={fetchNotifications}
                            className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : notifsFiltrees.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="p-4 bg-green-50 rounded-full w-fit mx-auto mb-3">
                            <Bell size={32} className="text-[#1B7A5A] opacity-40" />
                        </div>
                        <p className="text-gray-700 font-medium">Aucune notification</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {filtre === 'NON_LUES'
                                ? 'Vous avez lu toutes vos notifications.'
                                : 'Rien à afficher pour ce filtre.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifsFiltrees.map(n => (
                            <NotifItem key={n.id} notif={n} onMarquerLue={handleMarquerLue} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}