// src/modules/auth/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import { Wrench, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await axios.post("/api/auth/login", { email, password });
            const { token, role, email: userEmail } = response.data;
            login(token, role, userEmail);
            navigate(`/${role.toLowerCase()}/dashboard`);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Email ou mot de passe incorrect");
            } else {
                setError("Une erreur est survenue. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* ── Panneau gauche : formulaire ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-10">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1565C0]">
                            <Wrench className="text-white" size={18} />
                        </div>
                        <span className="text-lg font-semibold text-slate-800">GMSI</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        Connectez-vous à GMSI
                    </h1>
                    <p className="text-slate-500 text-sm mb-8">
                        Accédez à votre espace de gestion
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Adresse e-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="nom@gmsi.ma"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="text-[#1565C0] font-medium hover:underline">
                            Contactez votre administrateur
                        </Link>
                    </p>
                </div>
            </div>

            {/* ── Panneau droit : pitch (gradient) ── */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#1565C0] to-[#0D3C75]">
                {/* cercles décoratifs */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
                <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />

                <div className="relative flex flex-col justify-center px-16 text-white max-w-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
                            <Wrench size={16} />
                        </div>
                        <span className="font-semibold">GMSI</span>
                    </div>

                    <h2 className="text-3xl font-bold leading-tight mb-4">
                        Pilotez vos interventions<br />de maintenance.
                    </h2>
                    <p className="text-blue-100 mb-8 leading-relaxed">
                        De la demande à la clôture, chaque intervention tracée,
                        chaque technicien coordonné.
                    </p>

                    <ul className="space-y-3">
                        {[
                            "Affectation intelligente des techniciens",
                            "Suivi en temps réel du cycle de vie",
                            "Gestion du stock et des pièces utilisées",
                            "Évaluation et scoring des interventions",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-blue-50">
                                <CheckCircle2 size={18} className="text-blue-200 shrink-0" />
                                <span className="text-sm">{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex gap-2 mt-10">
                        <span className="px-3 py-1 rounded-full bg-white/15 text-xs">Nouvelle</span>
                        <span className="px-3 py-1 rounded-full bg-white/15 text-xs">En cours</span>
                        <span className="px-3 py-1 rounded-full bg-white/15 text-xs">Terminée</span>
                    </div>
                </div>
            </div>
        </div>
    );
}