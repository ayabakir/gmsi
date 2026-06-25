// frontend/src/modules/administration/pages/AuditLog.jsx
import { useEffect, useMemo, useState } from 'react'
import { ScrollText, Download, ChevronLeft, ChevronRight, Activity, CalendarClock, Tag, UserCheck } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { rechercherAudit, exporterAuditCsv, listerUtilisateursPourFiltre } from '../api/audit.api'

const COULEURS_DONUT = ['#1B7A5A', '#4FA98A', '#8FCAB3', '#C5E3D6', '#E0B85C', '#D97757']

const TAILLE_PAGE = 50

export default function AuditLog() {
    const [entrees, setEntrees] = useState([])
    const [utilisateurs, setUtilisateurs] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState(null)
    const [exportEnCours, setExportEnCours] = useState(false)
    const [page, setPage] = useState(1)

    const [filtres, setFiltres] = useState({
        idUtilisateur: '',
        entiteType: '',
        dateDebut: '',
        dateFin: '',
    })

    useEffect(() => {
        listerUtilisateursPourFiltre()
            .then(setUtilisateurs)
            .catch((err) => {
                console.warn(
                    "Endpoint /api/admin/users indisponible, repli sur le champ texte :",
                    err
                )
                setUtilisateurs(null)
            })
    }, [])

    const rechercher = async () => {
        setChargement(true)
        setErreur(null)
        try {
            const data = await rechercherAudit(filtres)
            setEntrees(data)
            setPage(1)
        } catch (err) {
            console.error("Erreur lors du chargement de l'audit log :", err)
            setErreur("Impossible de charger l'audit log.")
        } finally {
            setChargement(false)
        }
    }

    useEffect(() => {
        rechercher()
    }, [])

    const entreesTriees = useMemo(
        () =>
            [...entrees].sort(
                (a, b) => new Date(b.dateAction) - new Date(a.dateAction)
            ),
        [entrees]
    )

    const totalPages = Math.max(1, Math.ceil(entreesTriees.length / TAILLE_PAGE))
    const entreesPage = entreesTriees.slice(
        (page - 1) * TAILLE_PAGE,
        page * TAILLE_PAGE
    )

    // KPI calculés à partir des entrées actuellement chargées (donc déjà
    // filtrées si des filtres sont actifs) — aucun appel réseau supplémentaire.
    const kpis = useMemo(() => {
        if (entreesTriees.length === 0) {
            return { total: 0, aujourdHui: 0, typeFrequent: '—', utilisateurActif: '—' }
        }

        const aujourdHui = new Date().toDateString()
        const compteAujourdHui = entreesTriees.filter(
            (e) => new Date(e.dateAction).toDateString() === aujourdHui
        ).length

        const compterParCle = (liste, cle) => {
            const compte = {}
            for (const item of liste) {
                const valeur = item[cle]
                if (!valeur) continue
                compte[valeur] = (compte[valeur] || 0) + 1
            }
            return Object.entries(compte).sort((a, b) => b[1] - a[1])[0]
        }

        const topType = compterParCle(entreesTriees, 'entiteType')
        const topUtilisateur = compterParCle(entreesTriees, 'emailUtilisateur')

        return {
            total: entreesTriees.length,
            aujourdHui: compteAujourdHui,
            typeFrequent: topType ? topType[0].toLowerCase() : '—',
            utilisateurActif: topUtilisateur ? topUtilisateur[0] : '—',
        }
    }, [entreesTriees])

    // Données pour le donut "répartition par type d'entité"
    const donneesParType = useMemo(() => {
        const compte = {}
        for (const e of entreesTriees) {
            const cle = (e.entiteType || 'inconnu').toLowerCase()
            compte[cle] = (compte[cle] || 0) + 1
        }
        return Object.entries(compte)
            .map(([nom, valeur]) => ({ nom, valeur }))
            .sort((a, b) => b.valeur - a.valeur)
    }, [entreesTriees])

    // Données pour les barres "top utilisateurs" (5 maximum, pour rester lisible)
    const donneesParUtilisateur = useMemo(() => {
        const compte = {}
        for (const e of entreesTriees) {
            const cle = e.emailUtilisateur || 'inconnu'
            compte[cle] = (compte[cle] || 0) + 1
        }
        return Object.entries(compte)
            .map(([nom, valeur]) => ({ nom, valeur }))
            .sort((a, b) => b.valeur - a.valeur)
            .slice(0, 5)
    }, [entreesTriees])

    const exporter = async () => {
        setExportEnCours(true)
        try {
            await exporterAuditCsv(filtres)
        } finally {
            setExportEnCours(false)
        }
    }

    return (
        <div className="bg-gradient-to-b from-[#E8F5EE] via-[#F2F9F5] to-white min-h-screen p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-[#1B7A5A] rounded-lg p-2">
                            <ScrollText size={16} />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">Audit</h1>
                            <p className="text-xs text-slate-500">Historique des actions</p>
                        </div>
                    </div>
                    <button
                        onClick={exporter}
                        disabled={exportEnCours}
                        className="inline-flex items-center gap-1.5 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-60"
                    >
                        <Download size={14} />
                        {exportEnCours ? 'Export…' : 'Exporter'}
                    </button>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-xl shadow-sm p-3.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Total actions</span>
                            <Activity size={14} className="text-slate-400" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900">{kpis.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Aujourd'hui</span>
                            <CalendarClock size={14} className="text-slate-400" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900">{kpis.aujourdHui}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Type le plus modifié</span>
                            <Tag size={14} className="text-slate-400" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900 font-mono truncate">{kpis.typeFrequent}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Utilisateur le plus actif</span>
                            <UserCheck size={14} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate">{kpis.utilisateurActif}</p>
                    </div>
                </div>

                {/* Graphes */}
                {entreesTriees.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <p className="text-xs font-medium text-slate-600 mb-2">Répartition par type</p>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-32 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donneesParType}
                                                dataKey="valeur"
                                                nameKey="nom"
                                                innerRadius={32}
                                                outerRadius={56}
                                                paddingAngle={2}
                                            >
                                                {donneesParType.map((_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={COULEURS_DONUT[index % COULEURS_DONUT.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    {donneesParType.map((item, index) => (
                                        <div key={item.nom} className="flex items-center gap-2 text-xs">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: COULEURS_DONUT[index % COULEURS_DONUT.length] }}
                                            />
                                            <span className="font-mono text-slate-600 truncate">{item.nom}</span>
                                            <span className="text-slate-400 ml-auto">{item.valeur}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <p className="text-xs font-medium text-slate-600 mb-2">Top utilisateurs</p>
                            <div className="h-36">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={donneesParUtilisateur} layout="vertical" margin={{ left: 8, right: 8 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            type="category"
                                            dataKey="nom"
                                            width={120}
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip />
                                        <Bar dataKey="valeur" fill="#1B7A5A" radius={[0, 4, 4, 0]} barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtres */}
                <div className="bg-white rounded-xl shadow-sm p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                    {utilisateurs === null ? (
                        <input
                            type="text"
                            placeholder="Email"
                            value={filtres.idUtilisateur}
                            onChange={(e) =>
                                setFiltres((f) => ({ ...f, idUtilisateur: e.target.value }))
                            }
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                        />
                    ) : (
                        <select
                            value={filtres.idUtilisateur}
                            onChange={(e) =>
                                setFiltres((f) => ({ ...f, idUtilisateur: e.target.value }))
                            }
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                        >
                            <option value="">Tous les utilisateurs</option>
                            {utilisateurs.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.prenom} {u.nom}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        value={filtres.entiteType}
                        onChange={(e) =>
                            setFiltres((f) => ({ ...f, entiteType: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    >
                        <option value="">Tous les types</option>
                        <option value="PARAMETRE">Paramètre</option>
                        <option value="EQUIPEMENT">Équipement</option>
                        <option value="STOCK">Stock</option>
                        <option value="CATEGORIE">Catégorie</option>
                        <option value="LOCALISATION">Localisation</option>
                    </select>

                    <input
                        type="datetime-local"
                        value={filtres.dateDebut}
                        onChange={(e) =>
                            setFiltres((f) => ({ ...f, dateDebut: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    />

                    <input
                        type="datetime-local"
                        value={filtres.dateFin}
                        onChange={(e) =>
                            setFiltres((f) => ({ ...f, dateFin: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent"
                    />

                    <div className="md:col-span-4 flex justify-end">
                        <button
                            onClick={rechercher}
                            className="bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                            Filtrer
                        </button>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {chargement ? (
                        <div className="p-8 text-center text-sm text-slate-500">Chargement…</div>
                    ) : erreur ? (
                        <div className="p-8 text-center text-sm text-red-700">{erreur}</div>
                    ) : entreesTriees.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">Aucun résultat.</div>
                    ) : (
                        <>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Date</th>
                                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Utilisateur</th>
                                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Action</th>
                                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Type</th>
                                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Entité</th>
                                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">Détails</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {entreesPage.map((entree) => (
                                    <tr key={entree.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(entree.dateAction).toLocaleString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-900">
                                            {entree.emailUtilisateur || '—'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700">
                                                    {(entree.action || '').toLowerCase() || '—'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">
                                            {(entree.entiteType || '').toLowerCase() || '—'}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">
                                            {entree.idEntite ? String(entree.idEntite).slice(0, 8) : '—'}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-slate-500 max-w-xs truncate">
                                            {entree.details || '—'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200">
                                    <p className="text-xs text-slate-500">
                                        Page {page}/{totalPages} · {entreesTriees.length} résultats
                                    </p>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}