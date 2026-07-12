import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.profile = action.payload.profile || action.payload.user;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.profile = action.payload.profile || action.payload.user;
      state.error = null;
    },
    loadUserFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.profile = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  logoutSuccess,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
