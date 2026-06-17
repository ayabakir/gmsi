// src/modules/auth/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../api/axiosConfig";
import { useAuth } from "../../../context/AuthContext";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#8FB996] mb-4">
                        <LogIn className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#34403A]">GMSI</h1>
                    <p className="text-[#7A8576] mt-1">Connectez-vous à votre espace</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#EFEADD] p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[#4A5249] mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5AE9C]" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
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
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E3DECF] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8FB996] hover:bg-[#7BA683] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[#7A8576] mt-6">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="text-[#5C8A66] font-medium hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}