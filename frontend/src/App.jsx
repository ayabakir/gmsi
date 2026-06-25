// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

import './api/axiosConfig.js'
// Auth
import Login        from './modules/auth/pages/Login'
import Unauthorized from './modules/auth/pages/Unauthorized'

// Page d'accueil
import Home from './modules/home/pages/Home'

// Référentiels (Module I1)
import Categories   from './modules/referentiels/pages/Categories'
import Localisations from './modules/referentiels/pages/Localisations'
import Equipements  from './modules/referentiels/pages/Equipements'

// Stock (Module I2)
import Stock      from './modules/stock/pages/Stock'
import Mouvements from './modules/stock/pages/Mouvements'

// Employé — Demandes (Module A2)
import MesDemandes from './modules/employe/pages/MesDemandes'
import DemandeForm from './modules/employe/pages/DemandeForm'

// Responsable — Demandes (Module A2)
import DemandesResponsable from './modules/responsable/pages/DemandesResponsable'

// Intervention (Module A3)
import Interventions from './modules/responsable/pages/Interventions'
import InterventionForm from './modules/responsable/pages/InterventionForm'
import MesMissions from './modules/technicien/pages/MesMissions'

// Admin — Comptes (Module A1)
import Users           from './modules/admin/pages/Users'
import UserForm        from './modules/admin/pages/UserForm'
import UserSpecialites from './modules/admin/pages/UserSpecialites'

// Notifications (Module I3)
import Notifications from './modules/notifications/pages/Notifications'

//dashboard (Module I6)
import DashboardResponsable from './modules/dashboard/pages/DashboardResponsable'
import DashboardAdmin       from './modules/dashboard/pages/DashboardAdmin'

//connaissances (Module I4)
import BaseConnaissances from './modules/connaissances/pages/BaseConnaissances'

//audit-parametre (Module I5)
import Parametres from './modules/administration/pages/Parametres'
import AuditLog from './modules/administration/pages/AuditLog'

export default function App() {
    const { user } = useAuth()

    function getRoleHome(role) {
        switch (role) {
            case 'ADMIN':       return '/admin/dashboard'
            case 'RESPONSABLE': return '/responsable/dashboard'
            case 'TECHNICIEN':  return '/technicien/missions'
            case 'EMPLOYE':     return '/employe/demandes'
            default:            return '/login'
        }
    }

    return (
        <Routes>

            {/* ── Page d'accueil (racine, publique) ── */}
            <Route path="/" element={<Home />} />

            {/* ── Public ── */}
            <Route path="/login"        element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Redirection racine selon rôle */}
            <Route path="/" element={
                user
                    ? <Navigate to={getRoleHome(user.role)} replace />
                    : <Navigate to="/login" replace />
            } />

            {/* ── ADMIN ── */}
            <Route path="/admin" element={
                <PrivateRoute roles={['ADMIN']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="users"                 element={<Users />} />
                <Route path="users/nouveau"         element={<UserForm />} />
                <Route path="users/:id/modifier"    element={<UserForm />} />
                <Route path="users/:id/specialites" element={<UserSpecialites />} />
                <Route path="categories"            element={<Categories />} />
                <Route path="localisations"         element={<Localisations />} />
                <Route path="equipements"           element={<Equipements />} />
                <Route path="stock"                 element={<Stock />} />
                <Route path="mouvements"            element={<Mouvements />} />
                <Route path="notifications"         element={<Notifications />} />
                <Route path="dashboard" element={<DashboardAdmin />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="audit" element={<AuditLog />} />
            </Route>

            {/* ── RESPONSABLE ── */}
            <Route path="/responsable" element={
                <PrivateRoute roles={['RESPONSABLE']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="demandes"                element={<DemandesResponsable />} />
                <Route path="interventions"           element={<Interventions />} />
                <Route path="interventions/nouvelle"  element={<InterventionForm />} />
                <Route path="stock"                   element={<Stock />} />
                <Route path="mouvements"              element={<Mouvements />} />
                <Route path="notifications"           element={<Notifications />} />
                <Route path="dashboard" element={<DashboardResponsable />} />
            </Route>

            {/* ── TECHNICIEN ── */}
            <Route path="/technicien" element={
                <PrivateRoute roles={['TECHNICIEN']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="missions"      element={<MesMissions />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="connaissances" element={<BaseConnaissances />} />
            </Route>

            {/* ── EMPLOYE ── */}
            <Route path="/employe" element={
                <PrivateRoute roles={['EMPLOYE']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="demandes"          element={<MesDemandes />} />
                <Route path="demandes/nouvelle" element={<DemandeForm />} />
                <Route path="notifications"     element={<Notifications />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}