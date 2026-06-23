// gmsi-mono/frontend/src/modules/notifications/api/notifications.api.js

import axios from 'axios';

const BASE = '/api/notifications';

export const getMesNotifications = () =>
    axios.get(`${BASE}/mes-notifications`).then(r => r.data);

export const getNonLues = () =>
    axios.get(`${BASE}/non-lues/count`).then(r => r.data);

export const marquerLue = (id) =>
    axios.put(`${BASE}/${id}/lue`).then(r => r.data);

export const marquerToutesLues = () =>
    axios.put(`${BASE}/tout-lire`);

export const subscribePush = (subscription) =>
    axios.post('/api/push/subscribe', subscription);

export const updatePreference = (preference) =>
    axios.put('/api/user/preferences-notif', { preference });