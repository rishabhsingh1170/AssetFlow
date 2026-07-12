import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../../api/notification.api";

// BACKEND GAP: the server does not mount /api/notifications yet
// (notification.service.js is empty and nothing writes the notifications
// table). A 404 flips `unavailable` instead of `error` so the page can show
// a labeled empty state rather than a failure banner.
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await getNotifications(userId ? { userId } : {});
      // The axios interceptor already unwraps to the body { success, data }.
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || "Failed to fetch notifications",
        status: err.status,
      });
    }
  }
);

// Optimistic: read_at is stamped locally in pending and reverted from a
// snapshot if the request fails.
export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await markNotificationRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to mark notification read");
    }
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to mark notifications read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    loading: false,
    error: null,
    unavailable: false,
    filter: "all",
    // Internal: pre-mutation copy of items for optimistic rollback.
    snapshot: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unavailable = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 404) {
          state.unavailable = true;
        } else {
          state.error = action.payload?.message || "Failed to fetch notifications";
        }
      })
      // Mark one read (optimistic)
      .addCase(markRead.pending, (state, action) => {
        state.snapshot = state.items.map((item) => ({ ...item }));
        const item = state.items.find((n) => n.id === action.meta.arg);
        if (item && !item.read_at) {
          item.read_at = new Date().toISOString();
        }
      })
      .addCase(markRead.fulfilled, (state) => {
        state.snapshot = null;
      })
      .addCase(markRead.rejected, (state) => {
        if (state.snapshot) {
          state.items = state.snapshot;
          state.snapshot = null;
        }
      })
      // Mark all read (optimistic)
      .addCase(markAllRead.pending, (state) => {
        state.snapshot = state.items.map((item) => ({ ...item }));
        const now = new Date().toISOString();
        state.items.forEach((item) => {
          if (!item.read_at) item.read_at = now;
        });
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.snapshot = null;
      })
      .addCase(markAllRead.rejected, (state) => {
        if (state.snapshot) {
          state.items = state.snapshot;
          state.snapshot = null;
        }
      });
  },
});

export const { setFilter } = notificationSlice.actions;

// Consumed by the TopBar bell badge.
export const selectUnreadCount = (state) =>
  state.notifications.items.filter((n) => !n.read_at).length;

export default notificationSlice.reducer;
