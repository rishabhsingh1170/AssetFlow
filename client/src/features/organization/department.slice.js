import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../api/department.api";

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDepartments();
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to fetch departments"
      );
    }
  }
);

export const addDepartment = createAsyncThunk(
  "department/addDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await createDepartment(departmentData);
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to create department"
      );
    }
  }
);

export const editDepartment = createAsyncThunk(
  "department/editDepartment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateDepartment(id, data);
      // The axios interceptor already unwraps to the body { success, data }.
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to update department"
      );
    }
  }
);

export const removeDepartment = createAsyncThunk(
  "department/removeDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDepartment(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to delete department"
      );
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
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
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addDepartment.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Edit
      .addCase(editDepartment.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(editDepartment.fulfilled, (state, action) => {
        state.submitLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(editDepartment.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Remove
      .addCase(removeDepartment.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeDepartment.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearSubmitError } = departmentSlice.actions;
export default departmentSlice.reducer;
