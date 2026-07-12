import { login, logout, getMe, signup } from "../../../../api/auth.api";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  logoutSuccess,
} from "../auth.slice";

export const authService = {
  login: async (credentials, dispatch) => {
    dispatch(loginStart());
    try {
      const response = await login(credentials);
      
      const token = response.data?.token || response.data?.accessToken || response.data?.data?.token;
      const user = response.data?.user || response.data?.data?.user || response.data;
      const profile = response.data?.profile || response.data?.data?.profile || user;

      if (token) {
        localStorage.setItem("token", token);
      }
      
      dispatch(loginSuccess({ user, profile }));
      return { user, profile };
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed";
      dispatch(loginFailure(errMsg));
      throw new Error(errMsg);
    }
  },

  signup: async (userData, dispatch) => {
    dispatch(loginStart());
    try {
      const response = await signup(userData);
      
      const token = response.data?.token || response.data?.accessToken || response.data?.data?.token;
      const user = response.data?.user || response.data?.data?.user || response.data;
      const profile = response.data?.profile || response.data?.data?.profile || user;

      if (token) {
        localStorage.setItem("token", token);
        dispatch(loginSuccess({ user, profile }));
      } else {
        dispatch(loginSuccess({ user, profile }));
      }
      return { user, profile };
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Signup failed";
      dispatch(loginFailure(errMsg));
      throw new Error(errMsg);
    }
  },

  logout: async (dispatch) => {
    try {
      await logout();
    } catch (e) {
      console.warn("Backend logout failed, clearing local session", e);
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      dispatch(logoutSuccess());
    }
  },

  getCurrentUser: async (dispatch) => {
    dispatch(loadUserStart());
    try {
      const response = await getMe();
      const user = response.data?.user || response.data?.data?.user || response.data;
      const profile = response.data?.profile || response.data?.data?.profile || user;
      dispatch(loadUserSuccess({ user, profile }));
      return { user, profile };
    } catch (err) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      dispatch(loadUserFailure());
      throw err;
    }
  },
};

export default authService;
