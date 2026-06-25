// src/modules/notifications/api/notifications.api.js
import axios from 'axios';

const BASE = '/api/notifications';

export const getMesNotifications = () =>
    axios.get(`${BASE}/mes-notifications`).then(r => r.data);

export const getNonLuesCount = () =>
    axios.get(`${BASE}/non-lues/count`).then(r => r.data);

export const marquerLue = (id) =>
    axios.put(`${BASE}/${id}/lue`).then(r => r.data);

export const marquerToutLire = () =>
    axios.put(`${BASE}/tout-lire`).then(r => r.data);

export const updatePreferencesNotif = (preference) =>
    axios.put('/api/user/preferences-notif', { preference }).then(r => r.data);

// ADMIN uniquement
export const getTemplates = () =>
    axios.get('/api/admin/notifications/templates').then(r => r.data);

export const createTemplate = (data) =>
    axios.post('/api/admin/notifications/templates', data).then(r => r.data);