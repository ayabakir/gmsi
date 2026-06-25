// frontend/src/modules/administration/api/audit.api.js
import api from '../../../api/axiosConfig'

/**
 * Construit l'objet de query params à partir des filtres,
 * en omettant les valeurs vides/null pour ne pas polluer l'URL.
 */
const construireParams = ({ idUtilisateur, entiteType, dateDebut, dateFin } = {}) => {
    const params = {}
    if (idUtilisateur) params.idUtilisateur = idUtilisateur
    if (entiteType) params.entiteType = entiteType
    if (dateDebut) params.dateDebut = dateDebut
    if (dateFin) params.dateFin = dateFin
    return params
}

/**
 * Recherche les entrées d'audit selon des filtres facultatifs.
 */
export const rechercherAudit = async (filtres) => {
    const { data } = await api.get('/api/admin/audit', {
        params: construireParams(filtres),
    })
    return data
}

/**
 * Télécharge l'export CSV de l'audit log filtré.
 * Déclenche directement le téléchargement côté navigateur.
 */
export const exporterAuditCsv = async (filtres) => {
    const response = await api.get('/api/admin/audit/export-csv', {
        params: construireParams(filtres),
        responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
    const lien = document.createElement('a')
    lien.href = url
    lien.setAttribute('download', 'audit_log.csv')
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    window.URL.revokeObjectURL(url)
}

/**
 * Liste les utilisateurs pour alimenter le filtre "Utilisateur".
 * Réutilise l'endpoint existant /api/admin/users (UserController d'Aya).
 */
export const listerUtilisateursPourFiltre = async () => {
    const { data } = await api.get('/api/admin/users')
    return data
}