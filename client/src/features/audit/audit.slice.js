import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuditLogs } from "../../../api/audit.api";
import { cleanPayload } from "../../utils/validators";

// GET /api/audit returns activity_logs rows joined with actor_name and
// actor_email. Query params: actorUserId, entityTable, action, limit
// (max 500, default 100). Nothing writes activity_logs on the server yet,
// so an empty list is the expected steady state until logging lands.
export const fetchAuditLogs = createAsyncThunk(
  "audit/fetchAuditLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getAuditLogs(cleanPayload(params));
      // The axios interceptor already unwraps to the body { success, data }.
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch audit logs");
    }
  }
);

const auditSlice = createSlice({
  name: "audit",
  initialState: {
    logs: [],
    loading: false,
    error: null,
    filters: {
      entityTable: "",
      action: "",
      actorUserId: "",
      limit: 100,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters } = auditSlice.actions;
export default auditSlice.reducer;
