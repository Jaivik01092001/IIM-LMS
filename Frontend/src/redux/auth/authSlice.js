import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, logout as logoutApi, forgotPassword, resetPassword, refreshToken } from './authApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

// Login thunk
export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await login(credentials);

    // Store tokens and user data
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    showSuccessToast(`Welcome, ${data.user.name}!`);
    return data.user;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Login failed');
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

// Logout thunk
export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await logoutApi(refreshToken);
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    showSuccessToast('Logged out successfully');
    return null;
  } catch (error) {
    // Even if the API call fails, we still want to clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    showErrorToast(error.response?.data?.message || 'Error during logout');
    return rejectWithValue(error.response?.data?.message || 'Error during logout');
  }
});

// Refresh token thunk
export const refreshTokenThunk = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      return rejectWithValue('No refresh token available');
    }

    const data = await refreshToken(refreshTokenValue);
    localStorage.setItem('accessToken', data.accessToken);

    return data;
  } catch (error) {
    // If refresh token is invalid, clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    return rejectWithValue(error.response?.data?.message || 'Failed to refresh token');
  }
});

// Forgot password thunk
export const forgotPasswordThunk = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const data = await forgotPassword(email);
    showSuccessToast(data.message || 'Password reset instructions sent to your email');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to process request');
    return rejectWithValue(error.response?.data?.message || 'Failed to process request');
  }
});

// Reset password thunk
export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await resetPassword(data);
    showSuccessToast(response.message || 'Password reset successful');

    // If the response includes tokens, store them
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to reset password');
    return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
  }
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
    error: null,
  },
  reducers: {
    // Manual logout (without API call)
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      showSuccessToast('Logged out successfully');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.accessToken = localStorage.getItem('accessToken');
        state.refreshToken = localStorage.getItem('refreshToken');
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Logout cases
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // Refresh token cases
      .addCase(refreshTokenThunk.fulfilled, (state) => {
        state.accessToken = localStorage.getItem('accessToken');
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // Password reset cases
      .addCase(forgotPasswordThunk.pending, (state) => { state.loading = true; })
      .addCase(forgotPasswordThunk.fulfilled, (state) => { state.loading = false; })
      .addCase(forgotPasswordThunk.rejected, (state) => { state.loading = false; })

      .addCase(resetPasswordThunk.pending, (state) => { state.loading = true; })
      .addCase(resetPasswordThunk.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPasswordThunk.rejected, (state) => { state.loading = false; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;