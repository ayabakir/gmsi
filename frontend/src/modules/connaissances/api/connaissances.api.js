// gmsi-mono/frontend/src/modules/connaissances/api/connaissances.api.js
import api from '../../../api/axiosConfig'

const BASE = '/api/technicien/connaissances'

export const connaissancesApi = {
    rechercher: (categorieId, motCle) => {
        const params = {}
        if (categorieId) params.categorieId = categorieId
        if (motCle)      params.motCle      = motCle
        return api.get(`${BASE}/recherche`, { params })
    },
    getById:     (id) => api.get(`${BASE}/${id}`),
    listerToutes: ()  => api.get(`${BASE}/`),
}