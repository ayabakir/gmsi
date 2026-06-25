// src/modules/notifications/api/notifications.api.js
import api from '../../../api/axiosConfig'

export const getMesNotifications = () =>
    api.get('/api/notifications/mes-notifications').then(r => r.data)

export const getNonLuesCount = () =>
    api.get('/api/notifications/non-lues/count').then(r => r.data)

export const marquerLue = (id) =>
    api.put(`/api/notifications/${id}/lue`).then(r => r.data)

export const marquerToutLire = () =>
    api.put('/api/notifications/tout-lire').then(r => r.data)

export const updatePreferencesNotif = (preference) =>
    api.put('/api/user/preferences-notif', { preference }).then(r => r.data)

export const getTemplates = () =>
    api.get('/api/admin/notifications/templates').then(r => r.data)

export const createTemplate = (data) =>
    api.post('/api/admin/notifications/templates', data).then(r => r.data)