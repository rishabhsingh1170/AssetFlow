import api from './axios';

export const getBookings = (params = {}) => api.get('/bookings', { params });

export const getBookingById = (id) => api.get(`/bookings/${id}`);

export const createBooking = (payload) => api.post('/bookings', payload);

export const updateBooking = (id, payload) => api.put(`/bookings/${id}`, payload);

export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

export const approveBooking = (id) =>
  updateBooking(id, { status: 'approved' });

export const rejectBooking = (id) =>
  updateBooking(id, { status: 'rejected' });

export const cancelBooking = (id, payload = {}) =>
  updateBooking(id, { ...payload, status: 'cancelled' });

export const completeBooking = (id, payload = {}) =>
  updateBooking(id, { ...payload, status: 'completed' });

export const bookingApi = {
  approveBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  rejectBooking,
  updateBooking,
};

export default bookingApi;
