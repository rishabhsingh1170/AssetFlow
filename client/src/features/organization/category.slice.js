import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../api/category.api";

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const addCategory = createAsyncThunk(
  "category/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await createCategory(categoryData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const editCategory = createAsyncThunk(
  "category/editCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateCategory(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const removeCategory = createAsyncThunk(
  "category/removeCategory",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "category",
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
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addCategory.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Edit
      .addCase(editCategory.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      // Remove
      .addCase(removeCategory.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearSubmitError } = categorySlice.actions;
export default categorySlice.reducer;
