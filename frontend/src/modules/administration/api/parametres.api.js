// frontend/src/modules/administration/api/parametres.api.js
import api from '../../../api/axiosConfig'

/**
 * Récupère tous les paramètres système.
 */
export const listerParametres = async () => {
    const { data } = await api.get('/api/admin/parametres')
    return data
}

/**
 * Récupère un paramètre par sa clé.
 */
export const getParametre = async (cle) => {
    const { data } = await api.get(`/api/admin/parametres/${cle}`)
    return data
}

/**
 * Modifie la valeur (et éventuellement la description) d'un paramètre.
 * La clé n'est jamais envoyée dans le body, elle est immuable.
 */
export const modifierParametre = async (cle, { valeur, description }) => {
    const { data } = await api.put(`/api/admin/parametres/${cle}`, {
        valeur,
        description,
    })
    return data
}