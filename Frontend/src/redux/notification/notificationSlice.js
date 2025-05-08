import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./notificationApi";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Async thunks
export const getUserNotificationsThunk = createAsyncThunk(
  "notification/getUserNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getUserNotifications();
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to fetch notifications"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsReadThunk = createAsyncThunk(
  "notification/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await api.markNotificationAsRead(notificationId);
      return { notificationId, ...data };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to mark notification as read"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsReadThunk = createAsyncThunk(
  "notification/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.markAllNotificationsAsRead();
      showSuccessToast(data.message || "All notifications marked as read");
      return data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to mark all notifications as read"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all notifications as read"
      );
    }
  }
);

export const deleteNotificationThunk = createAsyncThunk(
  "notification/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await api.deleteNotification(notificationId);
      showSuccessToast(data.message || "Notification deleted successfully");
      return { notificationId, ...data };
    } catch (error) {
      console.error("Error deleting notification:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to delete notification"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get user notifications
      .addCase(getUserNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserNotificationsThunk.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.loading = false;
      })
      .addCase(getUserNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark notification as read and remove it from the list
      .addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
        // Remove the notification from the list instead of just marking it as read
        state.notifications = state.notifications.filter(
          notification => notification._id !== action.payload.notificationId
        );
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      })

      // Mark all notifications as read and clear the list
      .addCase(markAllNotificationsAsReadThunk.fulfilled, (state) => {
        // Clear all notifications from the list
        state.notifications = [];
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(
          n => n._id === action.payload.notificationId
        );
        state.notifications = state.notifications.filter(
          notification => notification._id !== action.payload.notificationId
        );
        if (deletedNotification && !deletedNotification.read) {
          state.unreadCount -= 1;
        }
      });
  },
});

export default notificationSlice.reducer;
