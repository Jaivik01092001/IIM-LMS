import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './universityApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export const createEducatorThunk = createAsyncThunk('university/createEducator', async (educatorData, { rejectWithValue }) => {
  try {
    const data = await api.createEducator(educatorData);
    showSuccessToast(data.msg || 'Educator created successfully');
    return data;
  } catch (error) {
    // Check for specific error messages from the backend
    const errorMessage = error.response?.data?.message || 'Failed to create educator';
    const fieldErrors = error.response?.data?.errors;

    // If we have field-specific errors, show the first one
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstErrorField = Object.keys(fieldErrors)[0];
      showErrorToast(fieldErrors[firstErrorField]);
    } else {
      showErrorToast(errorMessage);
    }

    return rejectWithValue({
      message: errorMessage,
      errors: fieldErrors
    });
  }
});

export const getEducatorsThunk = createAsyncThunk('university/getEducators', api.getEducators);

export const deleteEducatorThunk = createAsyncThunk('university/deleteEducator', async (id, { rejectWithValue }) => {
  try {
    const data = await api.deleteEducator(id);
    showSuccessToast(data.msg || 'Educator deleted successfully');
    return id; // Return the ID for state updates
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to delete educator');
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete educator');
  }
});

export const updateEducatorThunk = createAsyncThunk('university/updateEducator', async ({ id, ...educatorData }, { rejectWithValue }) => {
  try {
    const data = await api.updateEducator(id, educatorData);
    showSuccessToast(data.msg || 'Educator updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update educator');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update educator');
  }
});

export const updateProfileThunk = createAsyncThunk('university/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const data = await api.updateProfile(profileData);
    showSuccessToast(data.msg || 'Profile updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update profile');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update profile');
  }
});

export const updatePasswordThunk = createAsyncThunk('university/updatePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const data = await api.updatePassword(passwordData);
    showSuccessToast(data.msg || 'Password updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update password');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update password');
  }
});

const universitySlice = createSlice({
  name: 'university',
  initialState: {
    educators: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEducatorsThunk.fulfilled, (state, action) => { state.educators = action.payload; })
      .addCase(createEducatorThunk.fulfilled, (state, action) => { state.educators.push(action.payload); })
      .addCase(updateEducatorThunk.fulfilled, (state, action) => {
        const index = state.educators.findIndex(educator => educator._id === action.payload._id);
        if (index !== -1) state.educators[index] = action.payload;
      })
      .addCase(deleteEducatorThunk.fulfilled, (state, action) => {
        state.educators = state.educators.filter(educator => educator._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => { state.loading = true; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => { state.loading = false; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.error.message; }
      );
  },
});

export default universitySlice.reducer;