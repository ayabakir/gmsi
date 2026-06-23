// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Auth
import Login        from './modules/auth/pages/Login'
import Unauthorized from './modules/auth/pages/Unauthorized'
import Register     from './modules/auth/pages/Register'

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

<<<<<<< HEAD
// Notifications (Module I3) ✅
import Notifications from './modules/notifications/pages/Notifications'

=======
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
export default function App() {
    const { user } = useAuth()

    return (
        <Routes>
            {/* ── Public ── */}
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Redirection racine selon rôle */}
            <Route path="/" element={
                user
                    ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
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
                {/* ✅ Page notifications accessible à l'admin */}
                <Route path="notifications"         element={<Notifications />} />
            </Route>

<<<<<<< HEAD
            {/* ── RESPONSABLE ── */}
=======
            {/* Routes RESPONSABLE */}
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
            <Route path="/responsable" element={
                <PrivateRoute roles={['RESPONSABLE']}>
                    <Layout />
                </PrivateRoute>
            }>
<<<<<<< HEAD
                <Route path="stock"         element={<Stock />} />
                <Route path="mouvements"    element={<Mouvements />} />
                {/* ✅ Page notifications */}
                <Route path="notifications" element={<Notifications />} />
                {/* autres modules Aya */}
            </Route>

            {/* ── TECHNICIEN ── */}
=======
                <Route path="demandes"                element={<DemandesResponsable />} />
                <Route path="interventions"           element={<Interventions />} />
                <Route path="interventions/nouvelle"  element={<InterventionForm />} />
                <Route path="stock"      element={<Stock />} />
                <Route path="mouvements" element={<Mouvements />} />
            </Route>

            {/* Routes TECHNICIEN */}
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
            <Route path="/technicien" element={
                <PrivateRoute roles={['TECHNICIEN']}>
                    <Layout />
                </PrivateRoute>
            }>
<<<<<<< HEAD
                {/* ✅ Page notifications */}
                <Route path="notifications" element={<Notifications />} />
                {/* modules Aya */}
            </Route>

            {/* ── EMPLOYE ── */}
=======
                <Route path="missions" element={<MesMissions />} />
            </Route>

            {/* Routes EMPLOYE */}
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
            <Route path="/employe" element={
                <PrivateRoute roles={['EMPLOYE']}>
                    <Layout />
                </PrivateRoute>
            }>
<<<<<<< HEAD
                {/* ✅ Page notifications */}
                <Route path="notifications" element={<Notifications />} />
                {/* modules Aya */}
=======
                <Route path="demandes"          element={<MesDemandes />} />
                <Route path="demandes/nouvelle" element={<DemandeForm />} />
>>>>>>> 59ada3f0bbe444dd2466e35013ebe09804902e9b
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}