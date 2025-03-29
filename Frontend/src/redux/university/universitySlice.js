import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './universityApi';

export const createEducatorThunk = createAsyncThunk('university/createEducator', api.createEducator);
export const getEducatorsThunk = createAsyncThunk('university/getEducators', api.getEducators);
export const updateEducatorThunk = createAsyncThunk('university/updateEducator', api.updateEducator);
export const updateProfileThunk = createAsyncThunk('university/updateProfile', api.updateProfile);
export const updatePasswordThunk = createAsyncThunk('university/updatePassword', api.updatePassword);

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