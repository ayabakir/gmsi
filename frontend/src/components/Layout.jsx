// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard, Settings, Package,
<<<<<<< HEAD
    MapPin, Tag, Monitor, LogOut, Users
=======
    MapPin, Tag, Monitor, LogOut, Bell, Users, FileText
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
} from 'lucide-react'
import NotifBadge from '../modules/notifications/components/NotifBadge'

const menuAdmin = [
    { label: 'Dashboard',     path: '/admin/dashboard',     icon: LayoutDashboard },
    { label: 'Utilisateurs',  path: '/admin/users',         icon: Users },
    { label: 'Catégories',    path: '/admin/categories',    icon: Tag },
    { label: 'Localisations', path: '/admin/localisations', icon: MapPin },
    { label: 'Équipements',   path: '/admin/equipements',   icon: Monitor },
    { label: 'Stock',         path: '/admin/stock',         icon: Package },
    { label: 'Paramètres',    path: '/admin/parametres',    icon: Settings },
]

const menuResponsable = [
<<<<<<< HEAD
    { label: 'Dashboard',     path: '/responsable/dashboard',    icon: LayoutDashboard },
=======
    { label: 'Dashboard',     path: '/responsable/dashboard', icon: LayoutDashboard },
    { label: 'Demandes',      path: '/responsable/demandes',  icon: FileText },
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
    { label: 'Interventions', path: '/responsable/interventions', icon: Settings },
    { label: 'Stock',         path: '/responsable/stock',        icon: Package },
    { label: 'Mouvements',    path: '/responsable/mouvements',   icon: Settings },
]

const menuTechnicien = [
    { label: 'Mes missions', path: '/technicien/missions', icon: LayoutDashboard },
]

const menuEmploye = [
<<<<<<< HEAD
    { label: 'Mes demandes', path: '/employe/demandes', icon: LayoutDashboard },
=======
    { label: 'Mes demandes',  path: '/employe/demandes', icon: FileText },
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
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
            <aside className="w-64 bg-[#1565C0] flex flex-col">

                {/* Logo */}
                <div className="px-6 py-5 border-b border-blue-700">
                    <h1 className="text-white text-xl font-bold tracking-wide">
                        GMSI
                    </h1>
                    <p className="text-blue-200 text-xs mt-1">
                        Gestion des Interventions
                    </p>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menu.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                                 font-medium transition-colors ${
                                    isActive
                                        ? 'bg-white text-[#1565C0]'
                                        : 'text-blue-100 hover:bg-blue-700'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="px-4 py-4 border-t border-blue-700">
                    <p className="text-blue-200 text-xs truncate">{user?.email}</p>
                    <p className="text-white text-xs font-semibold mt-0.5">
                        {user?.role}
                    </p>
                    <button
                        onClick={handleLogout}
                        className="mt-3 flex items-center gap-2 text-blue-200
                                   hover:text-white text-xs transition-colors"
                    >
                        <LogOut size={14} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ── Contenu principal ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header — NotifBadge remplace l'ancien bouton Bell statique */}
                <header className="bg-white border-b border-gray-200 px-6 py-3
                                   flex items-center justify-between">
                    <h2 className="text-[#546E7A] text-sm font-medium">
                        Bienvenue,{' '}
                        <span className="text-[#1565C0] font-semibold">
                            {user?.email}
                        </span>
                    </h2>

                    {/* ✅ Badge dynamique Module I3 — remplace le <button Bell> statique */}
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