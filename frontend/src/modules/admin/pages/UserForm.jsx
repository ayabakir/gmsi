import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Save } from 'lucide-react'

const ROLES = ['EMPLOYE', 'TECHNICIEN', 'RESPONSABLE', 'ADMIN']

export default function UserForm() {
    const { id } = useParams()        // si présent → mode édition
    const isEdit = Boolean(id)
    const navigate = useNavigate()

    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        role: 'EMPLOYE',
    })
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [erreur, setErreur] = useState('')

    // En mode édition, charger les données de l'utilisateur
    useEffect(() => {
        if (!isEdit) return
        const charger = async () => {
            try {
                const { data } = await api.get(`/api/admin/users/${id}`)
                setForm({
                    nom: data.nom,
                    prenom: data.prenom,
                    email: data.email,
                    motDePasse: '',           // jamais rempli en édition
                    role: data.role,
                })
            } catch (e) {
                setErreur("Impossible de charger l'utilisateur")
            } finally {
                setLoading(false)
            }
        }
        charger()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setSaving(true)
        setErreur('')
        try {
            if (isEdit) {
                // L'update n'envoie pas le mot de passe
                await api.put(`/api/admin/users/${id}`, {
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    role: form.role,
                })
            } else {
                await api.post('/api/admin/users', form)
            }
            navigate('/admin/users')
        } catch (e) {
            // Affiche le message d'erreur du backend si dispo
            const msg = e.response?.data?.message
                || (e.response?.data?.champs
                    ? Object.values(e.response.data.champs).join(', ')
                    : "Erreur lors de l'enregistrement")
            setErreur(msg)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="text-gray-400">Chargement…</div>
    }

    return (
        <div className="max-w-xl">
            {/* En-tête */}
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-[#546E7A] hover:text-[#1565C0] text-sm mb-4 transition-colors"
            >
                <ArrowLeft size={16} /> Retour à la liste
            </button>

            <h1 className="text-2xl font-bold text-[#1565C0] mb-1">
                {isEdit ? 'Modifier un utilisateur' : 'Nouvel utilisateur'}
            </h1>
            <p className="text-[#546E7A] text-sm mb-6">
                {isEdit ? 'Mets à jour les informations du compte' : 'Crée un nouveau compte utilisateur'}
            </p>

            {erreur && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#546E7A] mb-1">Prénom</label>
                        <input
                            name="prenom"
                            value={form.prenom}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#546E7A] mb-1">Nom</label>
                        <input
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#546E7A] mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                    />
                </div>

                {/* Mot de passe : seulement en création */}
                {!isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-[#546E7A] mb-1">Mot de passe</label>
                        <input
                            name="motDePasse"
                            type="password"
                            value={form.motDePasse}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-[#546E7A] mb-1">Rôle</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                    >
                        {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
                    >
                        <Save size={18} />
                        {saving ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer')}
                    </button>
                </div>
            </div>
        </div>
    )
}