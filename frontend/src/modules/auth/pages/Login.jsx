// src/modules/auth/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import { Wrench, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

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

                    {/* Logo rond */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1B7A5A]">
                            <Wrench className="text-white" size={20} />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
                        Connectez-vous à GMSI
                    </h1>
                    <p className="text-slate-500 text-sm text-center mb-8">
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
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="vous@gmsi.ma"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">
                                    Mot de passe
                                </label>
                                <span className="text-xs text-[#1B7A5A] font-medium cursor-pointer hover:underline">
                                    Mot de passe oublié ?
                                </span>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A5A] focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Pas encore de compte ?{" "}
                        <span className="text-[#1B7A5A] font-medium">Contactez votre administrateur</span>
                    </p>
                </div>
            </div>

            {/* ── Panneau droit : pitch (vert très clair) ── */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#E8F5EE] via-[#F2F9F5] to-white">

                <div className="relative flex flex-col justify-center px-16 max-w-lg">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1B7A5A]">
                            <Wrench className="text-white" size={14} />
                        </div>
                        <span className="font-semibold text-slate-800">GMSI</span>
                    </div>

                    <h2 className="text-3xl font-bold leading-tight text-slate-900 mb-4">
                        Mission control pour<br />vos équipes terrain.
                    </h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        De la demande à la clôture, chaque intervention tracée,
                        chaque technicien coordonné.
                    </p>

                    <ul className="space-y-3 mb-10">
                        {[
                            "Affectation intelligente des techniciens",
                            "Suivi en temps réel du cycle de vie",
                            "Gestion du stock et des pièces utilisées",
                            "Évaluation et scoring des interventions",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-slate-700">
                                <CheckCircle2 size={18} className="text-[#1B7A5A] shrink-0" />
                                <span className="text-sm">{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600">Nouvelle</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600">En cours</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600">Terminée</span>
                    </div>
                </div>
            </div>
        </div>
    );
}