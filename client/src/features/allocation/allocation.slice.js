import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAssets, allocateAsset, returnAsset, transferAsset } from "../../../api/asset.api";
import { getAllocations } from "../../../api/allocation.api";

// No allocation listing endpoint exists, so the console works over the asset
// list: one fetch, both tabs (allocated / available) derived client-side.
export const fetchAllocationAssets = createAsyncThunk(
  "allocation/fetchAllocationAssets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAssets();
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch assets");
    }
  }
);

export const allocate = createAsyncThunk(
  "allocation/allocate",
  async ({ assetId, payload }, { rejectWithValue }) => {
    try {
      const response = await allocateAsset(assetId, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || "Failed to allocate asset",
        status: err.status,
      });
    }
  }
);

export const returnAllocation = createAsyncThunk(
  "allocation/returnAllocation",
  async ({ assetId, payload }, { rejectWithValue }) => {
    try {
      const response = await returnAsset(assetId, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || "Failed to return asset",
        status: err.status,
      });
    }
  }
);

export const requestTransfer = createAsyncThunk(
  "allocation/requestTransfer",
  async ({ assetId, payload }, { rejectWithValue }) => {
    try {
      const response = await transferAsset(assetId, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || "Failed to request transfer",
        status: err.status,
      });
    }
  }
);

// BACKEND GAP: GET /api/allocations is not mounted on the server yet, so this
// 404s today. The History tab tolerates that and flags itself unavailable.
export const fetchAllocationHistory = createAsyncThunk(
  "allocation/fetchAllocationHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllocations();
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || "Allocation history is unavailable",
        status: err.status,
      });
    }
  }
);

const replaceAsset = (state, asset) => {
  if (!asset?.id) return;
  const index = state.items.findIndex((item) => item.id === asset.id);
  if (index !== -1) {
    // Action responses return raw asset rows without join columns
    // (category_name etc.), so merge instead of replacing outright.
    state.items[index] = { ...state.items[index], ...asset };
  }
};

const allocationSlice = createSlice({
  name: "allocation",
  initialState: {
    items: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
    lastResult: null,
    history: {
      items: [],
      loading: false,
      unavailable: false,
    },
  },
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assets
      .addCase(fetchAllocationAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocationAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchAllocationAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Allocate
      .addCase(allocate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(allocate.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.lastResult = action.payload;
        replaceAsset(state, action.payload?.asset);
      })
      .addCase(allocate.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      // Return
      .addCase(returnAllocation.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(returnAllocation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.lastResult = action.payload;
        replaceAsset(state, action.payload?.asset);
      })
      .addCase(returnAllocation.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      // Transfer request (creates a record with status requested; the asset
      // row itself does not change until a review endpoint exists)
      .addCase(requestTransfer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(requestTransfer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.lastResult = action.payload;
      })
      .addCase(requestTransfer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      // History
      .addCase(fetchAllocationHistory.pending, (state) => {
        state.history.loading = true;
      })
      .addCase(fetchAllocationHistory.fulfilled, (state, action) => {
        state.history.loading = false;
        state.history.unavailable = false;
        state.history.items = action.payload || [];
      })
      .addCase(fetchAllocationHistory.rejected, (state) => {
        state.history.loading = false;
        state.history.unavailable = true;
      });
  },
});

export const { clearActionError } = allocationSlice.actions;
export default allocationSlice.reducer;
