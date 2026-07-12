import api from './axios';

export const getLocations = () => api.get('/locations');

export const getLocationById = (id) => api.get(`/locations/${id}`);

export const createLocation = (payload) => api.post('/locations', payload);

export const updateLocation = (id, payload) =>
  api.put(`/locations/${id}`, payload);

export const deleteLocation = (id) => api.delete(`/locations/${id}`);

export const locationApi = {
  createLocation,
  deleteLocation,
  getLocationById,
  getLocations,
  updateLocation,
};

export default locationApi;
