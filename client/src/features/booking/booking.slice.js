import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookings,
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from "../../../api/booking.api";
import { getAssets } from "../../../api/asset.api";

export const fetchBookings = createAsyncThunk(
  "booking/fetchBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getBookings(params);
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch bookings");
    }
  }
);

export const fetchBookableAssets = createAsyncThunk(
  "booking/fetchBookableAssets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAssets({ isSharedBookable: true });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch shared resources");
    }
  }
);

export const addBooking = createAsyncThunk(
  "booking/addBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createBooking(payload);
      return response.data;
    } catch (err) {
      // Overlaps violate a Postgres gist exclusion constraint and surface as
      // HTTP 500 mentioning no_overlapping_active_bookings; ConflictWarning
      // translates that message for the user.
      return rejectWithValue(err.message || "Failed to create booking");
    }
  }
);

export const setBookingStatus = createAsyncThunk(
  "booking/setBookingStatus",
  async ({ id, status, cancelledBy }, { rejectWithValue }) => {
    try {
      let response;
      if (status === "approved") response = await approveBooking(id);
      else if (status === "rejected") response = await rejectBooking(id);
      else if (status === "cancelled") response = await cancelBooking(id, { cancelledBy });
      else if (status === "completed") response = await completeBooking(id);
      else return rejectWithValue(`Unsupported booking status: ${status}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update booking");
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    items: [],
    loading: false,
    error: null,
    bookableAssets: [],
    bookableLoading: false,
    filters: {
      assetId: "",
      status: "",
      mineOnly: false,
    },
    submitLoading: false,
    submitError: null,
    actionLoading: false,
    actionError: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch bookable assets
      .addCase(fetchBookableAssets.pending, (state) => {
        state.bookableLoading = true;
      })
      .addCase(fetchBookableAssets.fulfilled, (state, action) => {
        state.bookableLoading = false;
        state.bookableAssets = action.payload || [];
      })
      .addCase(fetchBookableAssets.rejected, (state) => {
        state.bookableLoading = false;
        state.bookableAssets = [];
      })
      // Create booking
      .addCase(addBooking.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(addBooking.fulfilled, (state, action) => {
        state.submitLoading = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(addBooking.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Status changes (approve / reject / cancel / complete)
      .addCase(setBookingStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(setBookingStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (!updated?.id) return;
        const index = state.items.findIndex((item) => item.id === updated.id);
        if (index !== -1) {
          // PUT responses are raw rows without join columns (asset_name,
          // booked_by_name), so merge instead of replacing.
          state.items[index] = { ...state.items[index], ...updated };
        }
      })
      .addCase(setBookingStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { setFilters, clearSubmitError, clearActionError } = bookingSlice.actions;
export default bookingSlice.reducer;
