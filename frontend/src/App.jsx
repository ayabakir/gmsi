// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Auth
import Login from './modules/auth/pages/Login'
import Unauthorized from './modules/auth/pages/Unauthorized'
import Register from './modules/auth/pages/Register'

// Référentiels (Module I1)
import Categories from './modules/referentiels/pages/Categories'
import Localisations from './modules/referentiels/pages/Localisations'
import Equipements from './modules/referentiels/pages/Equipements'

// Stock (Module I2)
import Stock from './modules/stock/pages/Stock'
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
import Users from './modules/admin/pages/Users'
import UserForm from './modules/admin/pages/UserForm'
import UserSpecialites from './modules/admin/pages/UserSpecialites'

export default function App() {
    const { user } = useAuth()

    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Redirection racine selon rôle */}
            <Route path="/" element={
                user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
                    : <Navigate to="/login" replace />
            } />

            {/* Routes ADMIN protégées */}
            <Route path="/admin" element={
                <PrivateRoute roles={['ADMIN']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="users"                  element={<Users />} />
                <Route path="users/nouveau"          element={<UserForm />} />
                <Route path="users/:id/modifier"     element={<UserForm />} />
                <Route path="users/:id/specialites"  element={<UserSpecialites />} />

                <Route path="categories"    element={<Categories />} />
                <Route path="localisations" element={<Localisations />} />
                <Route path="equipements"   element={<Equipements />} />
                <Route path="stock"         element={<Stock />} />
                <Route path="mouvements"    element={<Mouvements />} />
                {/* Paramètres, Audit → à ajouter au fur et à mesure */}
            </Route>

            {/* Routes RESPONSABLE */}
            <Route path="/responsable" element={
                <PrivateRoute roles={['RESPONSABLE']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="demandes"                element={<DemandesResponsable />} />
                <Route path="interventions"           element={<Interventions />} />
                <Route path="interventions/nouvelle"  element={<InterventionForm />} />
                <Route path="stock"      element={<Stock />} />
                <Route path="mouvements" element={<Mouvements />} />
            </Route>

            {/* Routes TECHNICIEN */}
            <Route path="/technicien" element={
                <PrivateRoute roles={['TECHNICIEN']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="missions" element={<MesMissions />} />
            </Route>

            {/* Routes EMPLOYE */}
            <Route path="/employe" element={
                <PrivateRoute roles={['EMPLOYE']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="demandes"          element={<MesDemandes />} />
                <Route path="demandes/nouvelle" element={<DemandeForm />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}