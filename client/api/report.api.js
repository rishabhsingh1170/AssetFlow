import api from './axios';

export const getAssetReport = () => api.get('/reports/assets');

export const getBookingReport = () => api.get('/reports/bookings');

export const getMaintenanceReport = () => api.get('/reports/maintenance');

export const reportApi = {
  getAssetReport,
  getBookingReport,
  getMaintenanceReport,
};

export default reportApi;
