import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  startMaintenance,
  completeMaintenance,
  updateMaintenanceRequest,
} from "../../../api/maintenance.api";
import { getAssets } from "../../../api/asset.api";
import { getUsers } from "../../../api/user.api";
import { cleanPayload } from "../../utils/validators";

export const fetchMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchMaintenanceRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      // The axios interceptor already unwraps to the body { success, data }.
      const res = await getMaintenanceRequests(cleanPayload(params));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch maintenance requests");
    }
  }
);

export const addMaintenanceRequest = createAsyncThunk(
  "maintenance/addMaintenanceRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createMaintenanceRequest(cleanPayload(payload));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to raise maintenance request");
    }
  }
);

// status: "approved" | "rejected". The model persists the reviewer id.
export const reviewRequest = createAsyncThunk(
  "maintenance/reviewRequest",
  async ({ id, status, actorId }, { rejectWithValue }) => {
    try {
      const res =
        status === "approved"
          ? await approveMaintenanceRequest(id, cleanPayload({ approvedBy: actorId }))
          : await rejectMaintenanceRequest(id, cleanPayload({ rejectedBy: actorId }));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to review request");
    }
  }
);

export const assignTech = createAsyncThunk(
  "maintenance/assignTech",
  async ({ id, technicianUserId }, { rejectWithValue }) => {
    try {
      const res = await assignTechnician(id, technicianUserId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to assign technician");
    }
  }
);

// status: "in_progress" | "resolved" | "cancelled".
export const progressRequest = createAsyncThunk(
  "maintenance/progressRequest",
  async ({ id, status, resolutionNotes, actualCost }, { rejectWithValue }) => {
    try {
      let res;
      if (status === "in_progress") {
        res = await startMaintenance(id);
      } else if (status === "resolved") {
        res = await completeMaintenance(id, cleanPayload({ resolutionNotes, actualCost }));
      } else {
        res = await updateMaintenanceRequest(id, { status: "cancelled" });
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update request");
    }
  }
);

// GET /api/users is manager-gated on the server; non-managers get 401/403.
// Tolerate that by resolving to an empty list instead of surfacing an error.
export const fetchTechnicians = createAsyncThunk(
  "maintenance/fetchTechnicians",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUsers();
      return res.data;
    } catch (err) {
      if (err.status === 401 || err.status === 403) return [];
      return rejectWithValue(err.message || "Failed to fetch users");
    }
  }
);

export const fetchAssetOptions = createAsyncThunk(
  "maintenance/fetchAssetOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAssets();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch assets");
    }
  }
);

export const initialState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    priority: "",
    assetId: "",
    requestedBy: "",
  },
  assetOptions: [],
  technicians: [],
  submitLoading: false,
  submitError: null,
  actionLoadingId: null,
  actionError: null,
};

// PUT responses return raw rows without join columns (asset_name,
// requested_by_name, technician_name), so fulfilled handlers MERGE the
// payload over the existing row instead of replacing it.
const mergeById = (state, payload) => {
  if (!payload?.id) return;
  const index = state.items.findIndex((item) => item.id === payload.id);
  if (index !== -1) {
    state.items[index] = { ...state.items[index], ...payload };
  }
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
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
      // Fetch list
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Raise request
      .addCase(addMaintenanceRequest.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(addMaintenanceRequest.fulfilled, (state, action) => {
        state.submitLoading = false;
        if (action.payload) {
          // POST returns the raw row; patch join names from the asset options
          // list so the new card renders with tag and name immediately.
          const asset = state.assetOptions.find((a) => a.id === action.payload.asset_id);
          state.items.unshift({
            ...action.payload,
            asset_tag: action.payload.asset_tag || asset?.asset_tag,
            asset_name: action.payload.asset_name || asset?.name,
          });
        }
      })
      .addCase(addMaintenanceRequest.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Approve / reject
      .addCase(reviewRequest.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
        state.actionError = null;
      })
      .addCase(reviewRequest.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        mergeById(state, action.payload);
      })
      .addCase(reviewRequest.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload;
      })
      // Assign technician
      .addCase(assignTech.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
        state.actionError = null;
      })
      .addCase(assignTech.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        mergeById(state, action.payload);
        // Raw PUT row loses the technician join name; patch it from the
        // already-fetched technicians list so the card updates immediately.
        const technician = state.technicians.find(
          (u) => u.id === action.meta.arg.technicianUserId
        );
        if (technician && action.payload?.id) {
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index].technician_name = technician.full_name;
          }
        }
      })
      .addCase(assignTech.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload;
      })
      // Start / resolve / cancel
      .addCase(progressRequest.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
        state.actionError = null;
      })
      .addCase(progressRequest.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        mergeById(state, action.payload);
      })
      .addCase(progressRequest.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload;
      })
      // Technician options
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.technicians = action.payload || [];
      })
      // Asset options
      .addCase(fetchAssetOptions.fulfilled, (state, action) => {
        state.assetOptions = action.payload || [];
      });
  },
});

export const { setFilters, clearFilters, clearSubmitError, clearActionError } =
  maintenanceSlice.actions;

export default maintenanceSlice.reducer;
