import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardSummary } from "../../../api/dashboard.api";

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (params, { rejectWithValue }) => {
    try {
      // The axios interceptor already unwraps to the response body
      // { success, data }, so exactly one .data here.
      const res = await getDashboardSummary(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
