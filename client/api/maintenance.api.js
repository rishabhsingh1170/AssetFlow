import api from './axios';

export const getMaintenanceRequests = (params = {}) =>
  api.get('/maintenance', { params });

export const getMaintenanceRequestById = (id) =>
  api.get(`/maintenance/${id}`);

export const createMaintenanceRequest = (payload) =>
  api.post('/maintenance', payload);

export const updateMaintenanceRequest = (id, payload) =>
  api.put(`/maintenance/${id}`, payload);

export const deleteMaintenanceRequest = (id) =>
  api.delete(`/maintenance/${id}`);

export const approveMaintenanceRequest = (id, payload = {}) =>
  updateMaintenanceRequest(id, { ...payload, status: 'approved' });

export const rejectMaintenanceRequest = (id, payload = {}) =>
  updateMaintenanceRequest(id, { ...payload, status: 'rejected' });

export const assignTechnician = (id, technicianUserId) =>
  updateMaintenanceRequest(id, {
    status: 'technician_assigned',
    technicianUserId,
  });

export const startMaintenance = (id, payload = {}) =>
  updateMaintenanceRequest(id, { ...payload, status: 'in_progress' });

export const completeMaintenance = (id, payload = {}) =>
  updateMaintenanceRequest(id, { ...payload, status: 'resolved' });

export const maintenanceApi = {
  approveMaintenanceRequest,
  assignTechnician,
  completeMaintenance,
  createMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceRequestById,
  getMaintenanceRequests,
  rejectMaintenanceRequest,
  startMaintenance,
  updateMaintenanceRequest,
};

export default maintenanceApi;
