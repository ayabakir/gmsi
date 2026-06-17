// src/modules/auth/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../api/axiosConfig";
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const ROLES = [
    { value: "EMPLOYE", label: "Employé" },
    { value: "TECHNICIEN", label: "Technicien" },
    { value: "RESPONSABLE", label: "Responsable" },
    { value: "ADMIN", label: "Administrateur" },
];

export default function Register() {
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "EMPLOYE",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post("/api/auth/register", form);
            navigate("/login");
        } catch (err) {
            if (err.response?.status === 409) {
                setError("Cet email est déjà utilisé.");
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Une erreur est survenue. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#8FB996] mb-4">
                        <UserPlus className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#34403A]">Créer un compte</h1>
                    <p className="text-[#7A8576] mt-1">Rejoignez la plateforme GMSI</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#EFEADD] p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#4A5249] mb-1.5">Prénom</label>
                                <input
                                    type="text" name="prenom" value={form.prenom} onChange={handleChange} required
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3DECF] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#4A5249] mb-1.5">Nom</label>
                                <input
                                    type="text" name="nom" value={form.nom} onChange={handleChange} required
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3DECF] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#4A5249] mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5AE9C]" size={18} />
                                <input
                                    type="email" name="email" value={form.email} onChange={handleChange} required
                                    placeholder="nom@gmsi.ma"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E3DECF] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#4A5249] mb-1.5">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5AE9C]" size={18} />
                                <input
                                    type="password" name="password" value={form.password} onChange={handleChange} required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E3DECF] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#4A5249] mb-1.5">Rôle</label>
                            <select
                                name="role" value={form.role} onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3DECF] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:border-transparent transition bg-white"
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-[#8FB996] hover:bg-[#7BA683] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {loading ? "Création..." : (<><CheckCircle2 size={18} /> Créer mon compte</>)}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[#7A8576] mt-6">
                        Déjà un compte ?{" "}
                        <Link to="/login" className="text-[#5C8A66] font-medium hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}