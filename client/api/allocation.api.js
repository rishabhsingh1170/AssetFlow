import api from './axios';

// Allocation actions are mounted as sub-routes of /api/assets.
export { allocateAsset, returnAsset, transferAsset } from './asset.api';

// BACKEND GAP: no /api/allocations router is mounted yet
// (server/routes/allocation.routes.js and allocation.service.js are empty).
// These calls 404 today; the UI tolerates that and shows a labeled empty state.
export const getAllocations = (params = {}) =>
  api.get('/allocations', { params });

export const getTransferRequests = (params = {}) =>
  api.get('/allocations/transfers', { params });

export default {
  getAllocations,
  getTransferRequests,
};
