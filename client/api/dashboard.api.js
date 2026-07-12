import api from './axios';

export const getDashboardSummary = (params = {}) =>
  api.get('/dashboard', { params });

export const dashboardApi = {
  getDashboardSummary,
};

export default dashboardApi;
