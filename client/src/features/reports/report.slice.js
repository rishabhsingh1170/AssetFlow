import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssetReport,
  getBookingReport,
  getMaintenanceReport,
} from "../../../api/report.api";

export const fetchAssetReport = createAsyncThunk(
  "report/fetchAssetReport",
  async (_, { rejectWithValue }) => {
    try {
      // The axios interceptor already unwraps to the body { success, data }.
      const res = await getAssetReport();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch asset report");
    }
  }
);

export const fetchBookingReport = createAsyncThunk(
  "report/fetchBookingReport",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getBookingReport();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch booking report");
    }
  }
);

export const fetchMaintenanceReport = createAsyncThunk(
  "report/fetchMaintenanceReport",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMaintenanceReport();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch maintenance report");
    }
  }
);

const emptyBucket = () => ({
  rows: [],
  loading: false,
  error: null,
  loaded: false,
});

export const initialState = {
  assets: emptyBucket(),
  bookings: emptyBucket(),
  maintenance: emptyBucket(),
};

const addBucketCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].loading = true;
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].loading = false;
      state[key].rows = action.payload || [];
      state[key].loaded = true;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].loading = false;
      state[key].error = action.payload;
    });
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addBucketCases(builder, fetchAssetReport, "assets");
    addBucketCases(builder, fetchBookingReport, "bookings");
    addBucketCases(builder, fetchMaintenanceReport, "maintenance");
  },
});

export default reportSlice.reducer;
