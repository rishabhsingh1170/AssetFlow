import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../../api/asset.api";
import { getLocations } from "../../../api/location.api";
import { cleanPayload } from "../../utils/validators";

// Prefer the first field-level validation message on 400s, then the
// interceptor's plain message.
const submitMessage = (err, fallback) =>
  err?.errors?.[0]?.message || err?.message || fallback;

export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (filters = {}, { rejectWithValue }) => {
    try {
      // The axios interceptor already unwraps to the body { success, data }.
      const res = await getAssets(cleanPayload(filters));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch assets");
    }
  }
);

export const fetchAssetById = createAsyncThunk(
  "assets/fetchAssetById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getAssetById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch asset details");
    }
  }
);

export const addAsset = createAsyncThunk(
  "assets/addAsset",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createAsset(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(submitMessage(err, "Failed to register asset"));
    }
  }
);

export const editAsset = createAsyncThunk(
  "assets/editAsset",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateAsset(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(submitMessage(err, "Failed to update asset"));
    }
  }
);

export const removeAsset = createAsyncThunk(
  "assets/removeAsset",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAsset(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete asset");
    }
  }
);

export const fetchLocations = createAsyncThunk(
  "assets/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getLocations();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch locations");
    }
  }
);

const initialFilters = {
  search: "",
  status: "",
  categoryId: "",
  departmentId: "",
  locationId: "",
  condition: "",
};

const assetsSlice = createSlice({
  name: "assets",
  initialState: {
    items: [],
    loading: false,
    error: null,
    status: "idle",
    filters: { ...initialFilters },
    selected: null,
    detailLoading: false,
    locations: [],
    submitLoading: false,
    submitError: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { ...initialFilters };
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchAssets.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch one (drawer detail refresh)
      .addCase(fetchAssetById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.detailLoading = false;
        const payload = action.payload;
        if (!payload) return;
        if (state.selected && state.selected.id === payload.id) {
          state.selected = { ...state.selected, ...payload };
        } else {
          state.selected = payload;
        }
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...payload };
        }
      })
      .addCase(fetchAssetById.rejected, (state) => {
        state.detailLoading = false;
      })
      // Add
      .addCase(addAsset.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        state.submitLoading = false;
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(addAsset.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Edit: PUT responses come back WITHOUT join columns (category_name,
      // location_name, owning_department_name), so always MERGE by id.
      .addCase(editAsset.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(editAsset.fulfilled, (state, action) => {
        state.submitLoading = false;
        const payload = action.payload;
        if (!payload) return;
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...payload };
        }
        if (state.selected && state.selected.id === payload.id) {
          state.selected = { ...state.selected, ...payload };
        }
      })
      .addCase(editAsset.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Remove (errors are surfaced via toast at the call site)
      .addCase(removeAsset.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selected && state.selected.id === action.payload) {
          state.selected = null;
        }
      })
      // Location lookup (used by the filters row and the register form)
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations = action.payload || [];
      });
  },
});

export const { setFilters, clearFilters, setSelected, clearSubmitError } =
  assetsSlice.actions;

export default assetsSlice.reducer;
