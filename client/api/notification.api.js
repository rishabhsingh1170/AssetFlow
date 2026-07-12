import api from './axios';

// BACKEND GAP: no /api/notifications router is mounted yet
// (notification.service.js, models/Notification.js, and server/jobs/* are empty,
// and nothing writes the notifications table). These calls 404 today; the UI
// tolerates that and shows a labeled empty state.
export const getNotifications = (params = {}) =>
  api.get('/notifications', { params });

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all');

export const notificationApi = {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
};

export default notificationApi;
