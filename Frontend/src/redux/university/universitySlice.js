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

export const getEducatorByIdThunk = createAsyncThunk(
  'university/getEducatorById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await api.getEducatorById(id);
      return data;
    } catch (error) {
      showErrorToast(error.response?.data?.msg || 'Failed to fetch educator details');
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch educator details');
    }
  }
);

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

export const updateEducatorThunk = createAsyncThunk('university/updateEducator', async (payload, { rejectWithValue }) => {
  try {
    const id = payload.id;
    // Handle both cases: when formData is provided or when individual fields like status are provided
    const data = payload.formData
      ? await api.updateEducator(id, payload.formData)
      : await api.updateEducator(id, payload);

    showSuccessToast(data.msg || 'Educator updated successfully');
    return data.educator || data; // Handle both response formats
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

export const getOngoingCoursesThunk = createAsyncThunk('university/getOngoingCourses', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getOngoingCourses();
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to fetch ongoing courses');
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch ongoing courses');
  }
});

const universitySlice = createSlice({
  name: 'university',
  initialState: {
    educators: [],
    currentEducator: null,
    ongoingCourses: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEducatorsThunk.fulfilled, (state, action) => { state.educators = action.payload; })
      .addCase(getEducatorByIdThunk.fulfilled, (state, action) => { state.currentEducator = action.payload; })
      .addCase(createEducatorThunk.fulfilled, (state, action) => { state.educators.push(action.payload); })
      .addCase(updateEducatorThunk.fulfilled, (state, action) => {
        // Handle both response formats (with _id or id)
        const educatorId = action.payload._id || action.payload.id;

        // Update in educators array
        const index = state.educators.findIndex(educator =>
          (educator._id === educatorId) || (educator.id === educatorId)
        );

        if (index !== -1) {
          // Preserve the id property if it exists in the current state
          state.educators[index] = {
            ...action.payload,
            id: state.educators[index].id || action.payload.id || action.payload._id
          };
        }

        // Also update currentEducator if it's the same educator
        if (state.currentEducator &&
            ((state.currentEducator._id === educatorId) ||
             (state.currentEducator.id === educatorId))) {
          state.currentEducator = {
            ...action.payload,
            id: state.currentEducator.id || action.payload.id || action.payload._id
          };
        }
      })
      .addCase(deleteEducatorThunk.fulfilled, (state, action) => {
        state.educators = state.educators.filter(educator => educator._id !== action.payload);
        // Clear currentEducator if it was deleted
        if (state.currentEducator && state.currentEducator._id === action.payload) {
          state.currentEducator = null;
        }
      })
      .addCase(getOngoingCoursesThunk.fulfilled, (state, action) => {
        state.ongoingCourses = action.payload;
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