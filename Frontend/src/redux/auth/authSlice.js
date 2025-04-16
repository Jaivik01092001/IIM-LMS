import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestOTP, verifyOTP, logout as logoutApi, forgotAccount, refreshToken } from './authApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

// Request OTP thunk
export const requestOTPThunk = createAsyncThunk('auth/requestOTP', async (credentials, { rejectWithValue }) => {
  try {
    const data = await requestOTP(credentials);
    showSuccessToast(data.message || 'OTP sent successfully. Check your phone and email.');
    return {
      userId: data.userId,
      debugOtp: data.debugOtp // Pass the debug OTP from development environment
    };
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to send OTP');
    return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
  }
});

// Verify OTP thunk (login)
export const verifyOTPThunk = createAsyncThunk('auth/verifyOTP', async (verificationData, { rejectWithValue }) => {
  try {
    const data = await verifyOTP(verificationData);

    // Store tokens and user data
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    showSuccessToast(`Welcome, ${data.user.name}!`);
    return data.user;
  } catch (error) {
    // Don't show toast here - we'll handle errors in the component
    return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
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

// Forgot account thunk
export const forgotAccountThunk = createAsyncThunk('auth/forgotAccount', async (email, { rejectWithValue }) => {
  try {
    const data = await forgotAccount(email);
    showSuccessToast(data.message || 'OTP sent to your registered phone number and email');
    return {
      userId: data.userId,
      debugOtp: data.debugOtp // Pass the debug OTP from development environment
    };
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to process request');
    return rejectWithValue(error.response?.data?.message || 'Failed to process request');
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
    otpRequested: false,
    userId: null,
    debugOtp: null, // Add debug OTP for development environment
  },
  reducers: {
    // Manual logout (without API call)
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.otpRequested = false;
      state.userId = null;
      state.debugOtp = null; // Clear debug OTP
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      showSuccessToast('Logged out successfully');
    },
    resetOTPState: (state) => {
      state.otpRequested = false;
      state.userId = null;
      state.debugOtp = null; // Clear debug OTP
    },
  },
  extraReducers: (builder) => {
    builder
      // Request OTP cases
      .addCase(requestOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOTPThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.otpRequested = true;
        state.userId = action.payload.userId;
        state.debugOtp = action.payload.debugOtp; // Store debug OTP
        state.error = null;
      })
      .addCase(requestOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.otpRequested = false;
        state.error = action.payload || action.error.message;
      })

      // Verify OTP cases
      .addCase(verifyOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTPThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.accessToken = localStorage.getItem('accessToken');
        state.refreshToken = localStorage.getItem('refreshToken');
        state.otpRequested = false;
        state.userId = null;
        state.debugOtp = null; // Clear debug OTP
        state.error = null;
      })
      .addCase(verifyOTPThunk.rejected, (state, action) => {
        state.loading = false;
        // Don't clear otpRequested or userId so user stays on verification screen
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
        state.otpRequested = false;
        state.userId = null;
        state.debugOtp = null; // Clear debug OTP
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.otpRequested = false;
        state.userId = null;
        state.debugOtp = null; // Clear debug OTP
      })

      // Refresh token cases
      .addCase(refreshTokenThunk.fulfilled, (state) => {
        state.accessToken = localStorage.getItem('accessToken');
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.otpRequested = false;
        state.userId = null;
        state.debugOtp = null; // Clear debug OTP
      })

      // Forgot account cases
      .addCase(forgotAccountThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotAccountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.otpRequested = true;
        state.userId = action.payload.userId;
        state.debugOtp = action.payload.debugOtp; // Store debug OTP
      })
      .addCase(forgotAccountThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, resetOTPState } = authSlice.actions;
export default authSlice.reducer;