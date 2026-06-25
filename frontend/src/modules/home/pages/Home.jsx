// src/modules/home/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import {
    Wrench, ArrowRight, ClipboardList, Users, Package,
    Star, Bell, CheckCircle2
} from "lucide-react";

const features = [
    { icon: ClipboardList, titre: "Gestion des demandes", desc: "Les employés déclarent les pannes, les responsables valident et priorisent en un clic." },
    { icon: Users, titre: "Affectation des techniciens", desc: "Assignez le bon technicien selon ses spécialités et suivez sa charge de travail." },
    { icon: Package, titre: "Suivi du stock", desc: "Les pièces utilisées sont automatiquement décomptées du stock à chaque intervention." },
    { icon: Star, titre: "Évaluation & scoring", desc: "Notez les interventions et calculez un score pondéré par difficulté pour chaque technicien." },
    { icon: Bell, titre: "Notifications en temps réel", desc: "Chaque acteur est prévenu aux moments clés du cycle de vie d'une intervention." },
    { icon: Wrench, titre: "Rapports techniques", desc: "Chaque intervention est documentée, validée et clôturée par l'employé concerné." },
];

const etapes = [
    { label: "Demande", color: "bg-yellow-100 text-yellow-700" },
    { label: "Assignée", color: "bg-blue-100 text-blue-700" },
    { label: "Planifiée", color: "bg-purple-100 text-purple-700" },
    { label: "En cours", color: "bg-indigo-100 text-indigo-700" },
    { label: "Terminée", color: "bg-green-100 text-green-700" },
    { label: "Clôturée", color: "bg-slate-200 text-slate-700" },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">

            {/* ── Barre de navigation ── */}
            <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1B7A5A]">
                        <Wrench className="text-white" size={18} />
                    </div>
                    <span className="text-lg font-semibold text-slate-800">GMSI</span>
                </div>
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    Se connecter <ArrowRight size={16} />
                </button>
            </nav>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5EE] via-[#F2F9F5] to-white" />
                <div className="relative max-w-4xl mx-auto text-center px-6 py-24">
                    <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#C8E6D5] text-[#1B7A5A] text-xs font-medium mb-6">
                        Gestion de maintenance industrielle
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-5">
                        Pilotez vos interventions<br />
                        <span className="text-[#1B7A5A]">de maintenance</span> en toute simplicité
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
                        GMSI centralise la gestion des pannes, l'affectation des techniciens,
                        le suivi du stock et l'évaluation des interventions — de la déclaration à la clôture.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-2 bg-[#1B7A5A] hover:bg-[#15634A] text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        Accéder à la plateforme <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ── Frise du workflow ── */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">
                    Le cycle de vie d'une intervention
                </h2>
                <p className="text-center text-slate-500 mb-10">
                    Chaque demande suit un parcours clair et traçable
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {etapes.map((etape, i) => (
                        <div key={etape.label} className="flex items-center gap-2">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${etape.color}`}>
                                {etape.label}
                            </span>
                            {i < etapes.length - 1 && (
                                <ArrowRight size={16} className="text-slate-300" />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Cartes de fonctionnalités ── */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">
                        Tout ce qu'il faut pour gérer la maintenance
                    </h2>
                    <p className="text-center text-slate-500 mb-12">
                        Une plateforme complète, pensée pour chaque acteur
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, titre, desc }) => (
                            <div key={titre} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-green-50 mb-4">
                                    <Icon className="text-[#1B7A5A]" size={22} />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-2">{titre}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bandeau final ── */}
            <section className="bg-gradient-to-br from-[#1B7A5A] to-[#0F4D38] py-16">
                <div className="max-w-3xl mx-auto text-center px-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Prêt à optimiser votre maintenance ?
                    </h2>
                    <p className="text-green-50/80 mb-8">
                        Connectez-vous pour accéder à votre espace de gestion.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-2 bg-white text-[#1B7A5A] font-medium px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        Se connecter <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-100 py-6">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
                    <span>© 2026 GMSI — Gestion de maintenance</span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-[#1B7A5A]" /> Projet PFA
                    </span>
                </div>
            </footer>
        </div>
    );
}