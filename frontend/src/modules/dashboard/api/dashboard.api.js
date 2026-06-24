// gmsi-mono/frontend/src/modules/dashboard/api/dashboard.api.js
import api from '../../../api/api'

const BASE_URL = '/api/dashboard'

export const getDashboardResponsable = async () => {
    const response = await api.get(`${BASE_URL}/responsable/kpis`)
    return response.data
}

export const getDashboardAdmin = async () => {
    const response = await api.get(`${BASE_URL}/admin/kpis`)
    return response.data
}
