import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, updateUser } from "../../../api/user.api";

export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsers();
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to fetch employees"
      );
    }
  }
);

export const promoteEmployee = createAsyncThunk(
  "employee/promoteEmployee",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await updateUser(id, { role });
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to update employee role"
      );
    }
  }
);

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    items: [],
    loading: false,
    status: "idle",
    error: null,
    submitLoading: false,
    submitError: null,
  },
  reducers: {
    clearSubmitError: (state) => {
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload;
      })
      // Promote Role
      .addCase(promoteEmployee.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(promoteEmployee.fulfilled, (state, action) => {
        state.submitLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(promoteEmployee.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearSubmitError } = employeeSlice.actions;
export default employeeSlice.reducer;
