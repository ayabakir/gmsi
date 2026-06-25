// gmsi-mono/frontend/src/modules/dashboard/pages/DashboardResponsable.jsx
import { useState, useEffect } from 'react'
import { RefreshCw, Clock, AlertTriangle, ListChecks } from 'lucide-react'
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { getDashboardResponsable } from '../api/dashboard.api'

const COULEURS_STATUT = {
    EN_ATTENTE: '#94A3B8',
    ASSIGNEE:   '#1B7A5A',
    EN_COURS:   '#F59E0B',
    TERMINEE:   '#10B981',
    REJETEE:    '#EF4444',
}
const LABELS_STATUT = {
    EN_ATTENTE: 'En attente',
    ASSIGNEE:   'Assignée',
    EN_COURS:   'En cours',
    TERMINEE:   'Terminée',
    REJETEE:    'Rejetée',
}
const MEDAILLES = ['🥇', '🥈', '🥉']

export default function DashboardResponsable() {
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(null)
    const [tick, setTick]       = useState(0)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        getDashboardResponsable()
            .then((res) => { if (!cancelled) setData(res) })
            .catch((e) => { if (!cancelled) setError('Impossible de charger le dashboard.'); console.error(e) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [tick])

    const demandesData = data
        ? Object.entries(data.demandesParStatut).map(([k, v]) => ({
            name: LABELS_STATUT[k] ?? k, value: v, key: k }))
        : []

    const pannesData = data
        ? Object.entries(data.tauxPannesParCategorie)
            .map(([k, v]) => ({ categorie: k, count: v }))
            .sort((a, b) => b.count - a.count)
        : []

    const totalEnAttente   = data?.demandesParStatut?.EN_ATTENTE ?? 0
    const piecesSousAlerte = data?.piecesSousSeuilAlerte ?? 0
    const mttr = data?.mttrHeures != null ? `${data.mttrHeures} h` : null

    return (
        <div className="space-y-6">

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Vue d'ensemble des interventions et performances</p>
                </div>
                <button
                    onClick={() => setTick(t => t + 1)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1B7A5A] hover:bg-[#15634A]
                     text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Chargement…' : 'Actualiser'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard titre="DÉLAI MOYEN RÉSOLUTION"
                         valeur={loading ? '…' : (mttr ?? '—')}
                         sous={mttr ? 'Calculé sur interventions clôturées' : 'Pas encore de données'}
                         Icone={Clock} accent="#1B7A5A" />
                <KpiCard titre="PIÈCES SOUS SEUIL"
                         valeur={loading ? '…' : piecesSousAlerte}
                         sous={piecesSousAlerte > 0 ? 'Réapprovisionnement requis' : 'Stock suffisant'}
                         Icone={AlertTriangle} accent={piecesSousAlerte > 0 ? '#EF4444' : '#1B7A5A'}
                         alerte={piecesSousAlerte > 0} />
                <KpiCard titre="DEMANDES EN ATTENTE"
                         valeur={loading ? '…' : totalEnAttente}
                         sous="En attente d'assignation"
                         Icone={ListChecks} accent="#F59E0B" />
            </div>

            {!loading && data && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                                Répartition par statut
                            </h3>
                            {demandesData.length === 0 ? <Vide /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={demandesData} cx="50%" cy="50%" outerRadius={95} dataKey="value"
                                             label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                                             labelLine={false}>
                                            {demandesData.map(e => (
                                                <Cell key={e.key} fill={COULEURS_STATUT[e.key] ?? '#94A3B8'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={v => [v, 'Demandes']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                                Pannes par catégorie
                            </h3>
                            {pannesData.length === 0 ? <Vide /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={pannesData} layout="vertical"
                                              margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                        <XAxis type="number" allowDecimals={false}
                                               tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="categorie" width={120}
                                               tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                        <Tooltip formatter={v => [v, 'Demandes']} cursor={{ fill: '#E8F5EE' }} />
                                        <Bar dataKey="count" fill="#1B7A5A" radius={[0, 6, 6, 0]} maxBarSize={22} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                            Top Techniciens
                        </h3>
                        {(data.topTechniciens ?? []).length === 0 ? <Vide /> : (
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-gray-50 text-xs text-slate-600 uppercase">
                                    <th className="py-2.5 px-3 text-center rounded-l-lg w-10">#</th>
                                    <th className="py-2.5 px-3 text-left">Technicien</th>
                                    <th className="py-2.5 px-3 text-center">Score</th>
                                    <th className="py-2.5 px-3 text-center rounded-r-lg">Évaluations</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {data.topTechniciens.map((t, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-3 text-center text-lg">{MEDAILLES[i] ?? `#${i+1}`}</td>
                                        <td className={`py-3 px-3 ${i < 3 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                            {t.nomComplet}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                        <span className="bg-green-50 text-[#1B7A5A] rounded-full px-3 py-0.5 font-semibold text-xs">
                          {t.scorePondere?.toFixed(2) ?? '—'}
                        </span>
                                        </td>
                                        <td className="py-3 px-3 text-center text-slate-500">{t.nbEvaluations}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                            Charge des techniciens
                        </h3>
                        {(data.chargeTechniciens ?? []).length === 0 ? <Vide /> : (
                            <div className="space-y-4">
                                {data.chargeTechniciens.map((t, i) => {
                                    const total = t.nbInterventionsEnCours + t.nbInterventionsPlanifiees
                                    const max = Math.max(...data.chargeTechniciens.map(x =>
                                        x.nbInterventionsEnCours + x.nbInterventionsPlanifiees), 1)
                                    return (
                                        <div key={i} className="flex items-center gap-4">
                                            <span className="w-36 text-sm font-medium text-slate-700 truncate">{t.nomComplet}</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500"
                                                     style={{ width: `${(total / max) * 100}%`,
                                                         backgroundColor: total === 0 ? '#CBD5E1' : '#1B7A5A' }} />
                                            </div>
                                            <div className="flex gap-3 text-xs text-slate-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#1B7A5A] inline-block" />
                            {t.nbInterventionsEnCours} en cours
                        </span>
                                                <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                                                    {t.nbInterventionsPlanifiees} planifiées
                        </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function KpiCard({ titre, valeur, sous, Icone, accent, alerte }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border p-5 relative overflow-hidden
                     ${alerte ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: accent }} />
            <div className="pl-2">
                <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{titre}</p>
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${accent}18` }}>
                        <Icone size={16} color={accent} />
                    </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-2">{valeur}</p>
                <p className="text-xs text-slate-400 mt-1">{sous}</p>
            </div>
        </div>
    )
}

function Vide() {
    return <div className="flex justify-center py-10"><p className="text-sm text-slate-400">Aucune donnée disponible</p></div>
}