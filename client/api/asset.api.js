import api from './axios';

export const getAssets = (params = {}) => api.get('/assets', { params });

export const getAssetById = (id) => api.get(`/assets/${id}`);

export const createAsset = (payload) => api.post('/assets', payload);

export const updateAsset = (id, payload) => api.put(`/assets/${id}`, payload);

export const deleteAsset = (id) => api.delete(`/assets/${id}`);

export const allocateAsset = (id, payload) =>
  api.post(`/assets/${id}/allocate`, payload);

export const returnAsset = (id, payload = {}) =>
  api.post(`/assets/${id}/return`, payload);

export const transferAsset = (id, payload) =>
  api.post(`/assets/${id}/transfer`, payload);

export const assetApi = {
  allocateAsset,
  createAsset,
  deleteAsset,
  getAssetById,
  getAssets,
  returnAsset,
  transferAsset,
  updateAsset,
};

export default assetApi;
