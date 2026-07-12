import api from "./axios";

export const login = (credentials) => api.post("/auth/login", credentials);
export const signup = (userData) => api.post("/auth/signup", userData);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

export default {
  login,
  signup,
  logout,
  getMe,
};
