import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, forgotPassword, resetPassword } from './authApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showSuccessToast(`Welcome, ${data.user.name}!`);
    return data.user;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Login failed');
    return rejectWithValue(error.response?.data?.msg || 'Login failed');
  }
});
export const forgotPasswordThunk = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const data = await forgotPassword(email);
    showSuccessToast(data.msg || 'Password reset instructions sent to your email');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to process request');
    return rejectWithValue(error.response?.data?.msg || 'Failed to process request');
  }
});

export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await resetPassword(data);
    showSuccessToast(response.msg || 'Password reset successful');
    return response;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to reset password');
    return rejectWithValue(error.response?.data?.msg || 'Failed to reset password');
  }
});
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showSuccessToast('Logged out successfully');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPasswordThunk.fulfilled, (state) => { state.loading = false; });
  },
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;