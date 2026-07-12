import api from './axios';

export const getAuditLogs = (params = {}) => api.get('/audit', { params });

export const auditApi = {
  getAuditLogs,
};

export default auditApi;
