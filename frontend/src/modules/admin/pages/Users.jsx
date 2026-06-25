import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import { ArrowLeft, Save, UserCog } from 'lucide-react'

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
        return <div className="text-slate-400 text-sm">Chargement…</div>
    }

    return (
        <div className="max-w-xl space-y-6">

            {/* Retour */}
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-slate-500 hover:text-[#1B7A5A] text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Retour à la liste
            </button>

            {/* ── En-tête ── */}
            <div className="bg-gradient-to-r from-[#E8F5EE] via-[#F2F9F5] to-white rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-1">
                    <UserCog size={22} className="text-[#1B7A5A]" />
                    <h1 className="text-slate-900 font-semibold text-xl">
                        {isEdit ? 'Modifier un utilisateur' : 'Nouvel utilisateur'}
                    </h1>
                </div>
                <p className="text-slate-500 text-sm pl-9">
                    {isEdit ? 'Mettez à jour les informations du compte' : 'Créez un nouveau compte utilisateur'}
                </p>
            </div>

            {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* ── Formulaire ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Prénom</label>
                        <input
                            name="prenom"
                            value={form.prenom}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom</label>
                        <input
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                    />
                </div>

                {/* Mot de passe : seulement en création */}
                {!isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
                        <input
                            name="motDePasse"
                            type="password"
                            value={form.motDePasse}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Rôle</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
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
                        className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <Save size={18} />
                        {saving ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer')}
                    </button>
                </div>
            </div>
        </div>
    )
}