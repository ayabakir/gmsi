import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { UserPlus, Pencil, Power, Trash2, Award } from 'lucide-react'

const ROLES = ['', 'EMPLOYE', 'TECHNICIEN', 'RESPONSABLE', 'ADMIN']

export default function Users() {
    const [users, setUsers] = useState([])
    const [filtreRole, setFiltreRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [erreur, setErreur] = useState('')
    const navigate = useNavigate()

    const chargerUsers = useCallback(async () => {
        setLoading(true)
        setErreur('')
        try {
            const url = filtreRole
                ? `/api/admin/users?role=${filtreRole}`
                : '/api/admin/users'
            const { data } = await api.get(url)
            setUsers(data)
        } catch (e) {
            setErreur(e.response?.data?.message || "Erreur lors du chargement des utilisateurs")
        } finally {
            setLoading(false)
        }
    }, [filtreRole])

    useEffect(() => {
        chargerUsers()
    }, [chargerUsers])

    const toggleActif = async (u) => {
        try {
            const action = u.actif ? 'desactiver' : 'activer'
            await api.put(`/api/admin/users/${u.id}/${action}`)
            chargerUsers()
        } catch (e) {
            setErreur(e.response?.data?.message || "Erreur lors du changement de statut")
        }
    }

    const supprimer = async (u) => {
        if (!window.confirm(`Supprimer ${u.prenom} ${u.nom} ?`)) return
        try {
            await api.delete(`/api/admin/users/${u.id}`)
            chargerUsers()
        } catch (e) {
            setErreur(e.response?.data?.message || "Erreur lors de la suppression")
        }
    }

    return (
        <div>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1565C0]">Utilisateurs</h1>
                    <p className="text-[#546E7A] text-sm mt-1">
                        Gestion des comptes et des rôles
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/users/nouveau')}
                    className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                    <UserPlus size={18} /> Nouvel utilisateur
                </button>
            </div>

            {/* Filtre par rôle */}
            <div className="mb-4 flex items-center gap-3">
                <label className="text-sm text-[#546E7A] font-medium">Filtrer par rôle :</label>
                <select
                    value={filtreRole}
                    onChange={(e) => setFiltreRole(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                >
                    {ROLES.map((r) => (
                        <option key={r} value={r}>{r === '' ? 'Tous' : r}</option>
                    ))}
                </select>
            </div>

            {erreur && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* Tableau */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-[#546E7A] text-left">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Nom</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Rôle</th>
                        <th className="px-4 py-3 font-semibold">Statut</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">Chargement…</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">Aucun utilisateur</td></tr>
                    ) : (
                        users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {u.prenom} {u.nom}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                <td className="px-4 py-3">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1565C0]">
                                            {u.role}
                                        </span>
                                </td>
                                <td className="px-4 py-3">
                                    {u.actif ? (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Actif</span>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactif</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        {u.role === 'TECHNICIEN' && (
                                            <button
                                                onClick={() => navigate(`/admin/users/${u.id}/specialites`)}
                                                title="Spécialités"
                                                className="text-[#546E7A] hover:text-[#1565C0] transition-colors"
                                            >
                                                <Award size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/admin/users/${u.id}/modifier`)}
                                            title="Modifier"
                                            className="text-[#546E7A] hover:text-[#1565C0] transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleActif(u)}
                                            title={u.actif ? 'Désactiver' : 'Activer'}
                                            className={u.actif ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button
                                            onClick={() => supprimer(u)}
                                            title="Supprimer"
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}