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
                <Route path="categories"    element={<Categories />} />
                <Route path="localisations" element={<Localisations />} />
                <Route path="equipements"   element={<Equipements />} />
                <Route path="stock"         element={<Stock />} />
                <Route path="mouvements"    element={<Mouvements />} />
                {/* Paramètres, Audit → à ajouter au fur et à mesure */}
            </Route>

            {/* Routes RESPONSABLE — à compléter par Aya */}
            <Route path="/responsable" element={
                <PrivateRoute roles={['RESPONSABLE']}>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="stock"      element={<Stock />} />
                <Route path="mouvements" element={<Mouvements />} />
                {/* autres modules Aya */}
            </Route>

            {/* Routes TECHNICIEN — à compléter par Aya */}
            <Route path="/technicien" element={
                <PrivateRoute roles={['TECHNICIEN']}>
                    <Layout />
                </PrivateRoute>
            }>
                {/* modules Aya */}
            </Route>

            {/* Routes EMPLOYE — à compléter par Aya */}
            <Route path="/employe" element={
                <PrivateRoute roles={['EMPLOYE']}>
                    <Layout />
                </PrivateRoute>
            }>
                {/* modules Aya */}
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}