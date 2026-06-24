// gmsi-mono/frontend/src/modules/dashboard/pages/DashboardAdmin.jsx
import { useState, useEffect } from 'react'
import { RefreshCw, Users, Activity, Settings, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getDashboardAdmin } from '../api/dashboard.api'

const COULEURS_ROLE = {
    EMPLOYE:     '#60A5FA',
    TECHNICIEN:  '#1B7A5A',
    RESPONSABLE: '#F59E0B',
    ADMIN:       '#EF4444',
}
const BADGE_ACTION = {
    CREATE: 'bg-green-50 text-green-700',
    UPDATE: 'bg-yellow-50 text-yellow-700',
    DELETE: 'bg-red-50 text-red-700',
}

export default function DashboardAdmin() {
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(null)
    const [tick, setTick]       = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        getDashboardAdmin()
            .then((res) => { if (!cancelled) setData(res) })
            .catch((e) => { if (!cancelled) setError('Impossible de charger le dashboard admin.'); console.error(e) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [tick])

    const rolesData = data
        ? Object.entries(data.nbUtilisateursParRole).map(([k, v]) => ({ name: k, value: v }))
        : []

    return (
        <div className="space-y-6">

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Vue système globale — utilisateurs, audit et paramètres</p>
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
                <KpiCard titre="UTILISATEURS ACTIFS"
                         valeur={loading ? '…' : (data?.nbUtilisateursActifs ?? 0)}
                         sous="Comptes actifs en base" Icone={Users} accent="#1B7A5A" />
                <KpiCard titre="UTILISATEURS INACTIFS"
                         valeur={loading ? '…' : (data?.nbUtilisateursInactifs ?? 0)}
                         sous="Comptes désactivés" Icone={ShieldCheck} accent="#94A3B8" />
                <KpiCard titre="ACTIONS AUDIT (24H)"
                         valeur={loading ? '…' : (data?.nbActionsAuditRecentes ?? 0)}
                         sous="Dernières 24 heures" Icone={Activity} accent="#F59E0B" />
            </div>

            {!loading && data && (
                <>
                    {/* Rôles + Paramètres */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                                Répartition par rôle
                            </h3>
                            {rolesData.length === 0 ? <Vide /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={rolesData} cx="50%" cy="50%" outerRadius={95} dataKey="value"
                                             label={({ name, value }) => `${name} (${value})`}>
                                            {rolesData.map((e, i) => (
                                                <Cell key={i} fill={COULEURS_ROLE[e.name] ?? '#94A3B8'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Paramètres de scoring
                                </h3>
                                <button
                                    onClick={() => navigate('/admin/parametres')}
                                    className="flex items-center gap-1.5 text-xs text-[#1B7A5A] border
                             border-[#1B7A5A] rounded-lg px-3 py-1.5 hover:bg-green-50
                             transition-colors font-medium"
                                >
                                    <Settings size={13} /> Modifier
                                </button>
                            </div>
                            {Object.keys(data.parametresCoeffs ?? {}).length === 0 ? <Vide /> : (
                                <div className="space-y-2.5">
                                    {Object.entries(data.parametresCoeffs).map(([cle, val]) => (
                                        <div key={cle} className="flex items-center justify-between bg-gray-50
                                              rounded-lg px-4 py-3 hover:bg-green-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">
                        {cle.replace('COEFF_', '').charAt(0) +
                            cle.replace('COEFF_', '').slice(1).toLowerCase()}
                      </span>
                                            <span className="bg-green-50 text-[#1B7A5A] border border-green-200
                                       rounded-full px-3 py-0.5 text-sm font-bold">
                        {val}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audit */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Dernières actions (audit)
                            </h3>
                            <button onClick={() => navigate('/admin/audit')}
                                    className="text-xs text-[#1B7A5A] font-medium hover:underline">
                                Voir tout l'audit →
                            </button>
                        </div>
                        {(data.dernieresActionsAudit ?? []).length === 0 ? <Vide /> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="bg-gray-50 text-xs text-slate-600 uppercase">
                                        {['Action', 'Entité', 'Utilisateur', 'Détails', 'Date'].map((c, i) => (
                                            <th key={c} className={`py-2.5 px-3 text-left font-semibold
                                                ${i === 0 ? 'rounded-l-lg' : ''}
                                                ${i === 4 ? 'rounded-r-lg' : ''}`}>
                                                {c}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {data.dernieresActionsAudit.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                                           ${BADGE_ACTION[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                            {log.action}
                          </span>
                                            </td>
                                            <td className="py-3 px-3 text-slate-700 font-medium">{log.entiteType}</td>
                                            <td className="py-3 px-3 text-slate-500 text-xs">{log.emailUtilisateur}</td>
                                            <td className="py-3 px-3 text-slate-400 text-xs max-w-[180px] truncate">
                                                {log.details ?? '—'}
                                            </td>
                                            <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                                                {log.dateAction
                                                    ? new Date(log.dateAction).toLocaleString('fr-FR', {
                                                        dateStyle: 'short', timeStyle: 'short'
                                                    })
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function KpiCard({ titre, valeur, sous, Icone, accent }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
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