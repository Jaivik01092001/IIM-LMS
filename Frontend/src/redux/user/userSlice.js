import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLoggedInUser, updateLoggedInUser } from './userApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

// Get logged in user thunk
export const getLoggedInUserThunk = createAsyncThunk(
  'user/getLoggedInUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getLoggedInUser();
      // Check if the response has the expected structure
      if (data && data.status === 'success' && data.data && data.data.user) {
        return data.data.user;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user profile';
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update logged in user thunk
export const updateLoggedInUserThunk = createAsyncThunk(
  'user/updateLoggedInUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await updateLoggedInUser(userData);
      // Check if the response has the expected structure
      if (data && data.status === 'success' && data.data && data.data.user) {
        showSuccessToast('Profile updated successfully');
        return data.data.user;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get logged in user cases
      .addCase(getLoggedInUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoggedInUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getLoggedInUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update logged in user cases
      .addCase(updateLoggedInUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLoggedInUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;

        // Update user in localStorage to keep it in sync
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          name: action.payload.name,
          profile: action.payload.profile
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      })
      .addCase(updateLoggedInUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
