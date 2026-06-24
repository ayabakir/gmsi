// gmsi-mono/frontend/src/modules/dashboard/pages/DashboardAdmin.jsx
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Users, Activity, Settings, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { getDashboardAdmin } from '../api/dashboard.api'

const COULEURS_ROLE = {
    EMPLOYE:     '#42A5F5',
    TECHNICIEN:  '#1565C0',
    RESPONSABLE: '#E65100',
    ADMIN:       '#C62828',
}

export default function DashboardAdmin() {
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(null)
    const navigate = useNavigate()

    const charger = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            setData(await getDashboardAdmin())
        } catch (e) {
            setError('Impossible de charger le dashboard admin.')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { charger() }, [charger])

    const rolesData = data
        ? Object.entries(data.nbUtilisateursParRole).map(([k, v]) => ({ name: k, value: v }))
        : []

    return (
        <div className="space-y-6">

            {/* ── En-tête ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#1565C0]">Tableau de bord</h1>
                    <p className="text-sm text-[#546E7A] mt-0.5">Vue système globale — utilisateurs, audit et paramètres</p>
                </div>
                <button
                    onClick={charger}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1565C0] text-white
                     rounded-lg text-sm font-medium hover:bg-blue-700
                     disabled:opacity-60 transition-colors"
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

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                    titre="UTILISATEURS ACTIFS"
                    valeur={loading ? '…' : (data?.nbUtilisateursActifs ?? 0)}
                    sous="Comptes actifs en base"
                    Icone={Users}
                    couleur="#2E7D32"
                />
                <KpiCard
                    titre="UTILISATEURS INACTIFS"
                    valeur={loading ? '…' : (data?.nbUtilisateursInactifs ?? 0)}
                    sous="Comptes désactivés"
                    Icone={ShieldCheck}
                    couleur="#9E9E9E"
                />
                <KpiCard
                    titre="ACTIONS AUDIT (24H)"
                    valeur={loading ? '…' : (data?.nbActionsAuditRecentes ?? 0)}
                    sous="Dernières 24 heures"
                    Icone={Activity}
                    couleur="#1565C0"
                />
            </div>

            {!loading && data && (
                <>
                    {/* ── Graphique rôles + Paramètres ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* PieChart rôles */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-[#546E7A] uppercase tracking-wide mb-4">
                                Répartition par rôle
                            </h3>
                            {rolesData.length === 0 ? <Vide /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={rolesData} cx="50%" cy="50%" outerRadius={90}
                                             dataKey="value"
                                             label={({ name, value }) => `${name} (${value})`}>
                                            {rolesData.map((e, i) => (
                                                <Cell key={i} fill={COULEURS_ROLE[e.name] ?? '#607D8B'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Paramètres scoring */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-[#546E7A] uppercase tracking-wide">
                                    Paramètres de scoring
                                </h3>
                                <button
                                    onClick={() => navigate('/admin/parametres')}
                                    className="flex items-center gap-1.5 text-xs text-[#1565C0] border
                             border-[#1565C0] rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                                >
                                    <Settings size={13} /> Modifier
                                </button>
                            </div>

                            {Object.keys(data.parametresCoeffs ?? {}).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">
                                    Aucun paramètre COEFF_ trouvé en base.
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {Object.entries(data.parametresCoeffs).map(([cle, val]) => (
                                        <div key={cle}
                                             className="flex items-center justify-between bg-gray-50
                                    rounded-lg px-4 py-2.5">
                      <span className="text-sm font-medium text-[#546E7A]">
                        {cle.replace('COEFF_', '')}
                      </span>
                                            <span className="bg-blue-50 text-[#1565C0] rounded-full
                                       px-3 py-0.5 text-sm font-bold">
                        {val}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Dernières actions audit ── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-[#546E7A] uppercase tracking-wide">
                                Dernières actions (audit)
                            </h3>
                            <button
                                onClick={() => navigate('/admin/audit')}
                                className="text-xs text-[#1565C0] hover:underline"
                            >
                                Voir tout l'audit →
                            </button>
                        </div>

                        {(data.dernieresActionsAudit ?? []).length === 0 ? (
                            <Vide />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b-2 border-blue-50 text-xs text-[#546E7A] uppercase">
                                        {['Action', 'Entité', 'Utilisateur', 'Détails', 'Date'].map(c => (
                                            <th key={c} className="pb-2 text-left font-semibold pr-4">{c}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.dernieresActionsAudit.map((log) => (
                                        <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-2.5 pr-4">
                          <span className="bg-indigo-50 text-indigo-700 text-xs
                                           font-semibold px-2 py-0.5 rounded">
                            {log.action}
                          </span>
                                            </td>
                                            <td className="py-2.5 pr-4 text-gray-700">{log.entiteType}</td>
                                            <td className="py-2.5 pr-4 text-[#546E7A] text-xs">{log.emailUtilisateur}</td>
                                            <td className="py-2.5 pr-4 text-gray-400 text-xs max-w-[180px]
                                        truncate">
                                                {log.details ?? '—'}
                                            </td>
                                            <td className="py-2.5 text-[#546E7A] text-xs whitespace-nowrap">
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

function KpiCard({ titre, valeur, sous, Icone, couleur }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative">
            <div className="absolute top-4 right-4">
                <Icone size={20} color={couleur} />
            </div>
            <p className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide">{titre}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: couleur }}>{valeur}</p>
            <p className="text-xs text-gray-400 mt-1">{sous}</p>
        </div>
    )
}

function Vide() {
    return <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
}
