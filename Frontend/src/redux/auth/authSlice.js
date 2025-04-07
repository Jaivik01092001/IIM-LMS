import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, forgotPassword, resetPassword } from './authApi';
export const loginThunk = createAsyncThunk('auth/login', async (credentials) => {
  const data = await login(credentials);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
});
export const forgotPasswordThunk = createAsyncThunk('auth/forgotPassword', async (email) => {
  const data = await forgotPassword(email);
  return data;
});
export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (data) => {
  const response = await resetPassword(data);
  return response;
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