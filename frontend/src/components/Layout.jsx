// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard, Settings, Package, MapPin, Tag, Monitor,
    LogOut, Users, FileText, Wrench, ScrollText, History, Bell
} from 'lucide-react'
import NotifBadge from '../modules/notifications/components/NotifBadge'

const menuAdmin = [
    { label: 'Dashboard',     path: '/admin/dashboard',     icon: LayoutDashboard },
    { label: 'Utilisateurs',  path: '/admin/users',         icon: Users },
    { label: 'Catégories',    path: '/admin/categories',    icon: Tag },
    { label: 'Localisations', path: '/admin/localisations', icon: MapPin },
    { label: 'Équipements',   path: '/admin/equipements',   icon: Monitor },
    { label: 'Stock',         path: '/admin/stock',         icon: Package },
    { label: 'Mouvements',    path: '/admin/mouvements',    icon: History },
    { label: 'Audit',         path: '/admin/audit',         icon: ScrollText },
    { label: 'Paramètres',    path: '/admin/parametres',    icon: Settings },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
]

const menuResponsable = [
    { label: 'Dashboard',     path: '/responsable/dashboard',     icon: LayoutDashboard },
    { label: 'Demandes',      path: '/responsable/demandes',      icon: FileText },
    { label: 'Interventions', path: '/responsable/interventions', icon: Wrench },
    { label: 'Stock',         path: '/responsable/stock',         icon: Package },
    { label: 'Mouvements',    path: '/responsable/mouvements',    icon: History },
    { label: 'Notifications', path: '/responsable/notifications', icon: Bell },
]

const menuTechnicien = [
    { label: 'Mes missions',  path: '/technicien/missions',      icon: Wrench },
    { label: 'Notifications', path: '/technicien/notifications', icon: Bell },
]

const menuEmploye = [
    { label: 'Mes demandes',  path: '/employe/demandes',      icon: FileText },
    { label: 'Notifications', path: '/employe/notifications', icon: Bell },
]

function getMenu(role) {
    switch (role) {
        case 'ADMIN':       return menuAdmin
        case 'RESPONSABLE': return menuResponsable
        case 'TECHNICIEN':  return menuTechnicien
        case 'EMPLOYE':     return menuEmploye
        default:            return []
    }
}

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const menu = getMenu(user?.role)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-gray-100">

            {/* ── Sidebar ── */}
            <aside className="w-64 bg-gradient-to-b from-[#1B7A5A] to-[#15634A] flex flex-col">

                {/* Logo */}
                <div className="px-5 py-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15">
                            <Wrench className="text-white" size={18} />
                        </div>
                        <div>
                            <h1 className="text-white text-lg font-bold leading-none tracking-wide">
                                GMSI
                            </h1>
                            <p className="text-green-100/70 text-[11px] mt-1">
                                Gestion des Interventions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {menu.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                                 font-medium transition-colors ${
                                    isActive
                                        ? 'bg-white text-[#1B7A5A] shadow-sm'
                                        : 'text-green-50 hover:bg-white/10'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="px-4 py-4 border-t border-white/10">
                    <p className="text-green-100/70 text-xs truncate">{user?.email}</p>
                    <p className="text-white text-xs font-semibold mt-0.5">
                        {user?.role}
                    </p>
                    <button
                        onClick={handleLogout}
                        className="mt-3 flex items-center gap-2 text-green-100/80
                                   hover:text-white text-xs transition-colors"
                    >
                        <LogOut size={14} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ── Contenu principal ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header — NotifBadge dynamique (Module I3) */}
                <header className="bg-white border-b border-slate-200 px-6 py-3
                                   flex items-center justify-between">
                    <h2 className="text-slate-500 text-sm font-medium">
                        Bienvenue,{' '}
                        <span className="text-[#1B7A5A] font-semibold">
                            {user?.email}
                        </span>
                    </h2>

                    {/* Badge dynamique Module I3 */}
                    <NotifBadge />
                </header>

                {/* Pages */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}