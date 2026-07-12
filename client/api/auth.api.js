import api from './axios';

export const signup = (payload) => api.post('/auth/signup', payload);

export const login = (payload) => api.post('/auth/login', payload);

export const forgotPassword = (payload) =>
  api.post('/auth/forgot-password', payload);

export const resetPassword = (payload) =>
  api.post('/auth/reset-password', payload);

export const getCurrentUser = () => api.get('/auth/me');

export const logoutSession = () => api.post('/auth/logout');

export const logout = () => {
  localStorage.removeItem('assetflow_token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('assetflow_token', token);
};

export const authApi = {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  logoutSession,
  resetPassword,
  setAuthToken,
  signup,
};

export default authApi;
