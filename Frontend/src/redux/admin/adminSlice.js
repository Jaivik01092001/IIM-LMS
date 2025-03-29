import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './adminApi';

export const getUniversitiesThunk = createAsyncThunk('admin/getUniversities', api.getUniversities);
export const createUniversityThunk = createAsyncThunk('admin/createUniversity', api.createUniversity);
export const updateUniversityThunk = createAsyncThunk('admin/updateUniversity', api.updateUniversity);
export const getContentThunk = createAsyncThunk('admin/getContent', api.getContent);
export const createContentThunk = createAsyncThunk('admin/createContent', api.createContent);
export const updateContentThunk = createAsyncThunk('admin/updateContent', api.updateContent);
export const approveContentThunk = createAsyncThunk('admin/approveContent', api.approveContent);
export const rejectContentThunk = createAsyncThunk('admin/rejectContent', api.rejectContent);
export const deleteContentThunk = createAsyncThunk('admin/deleteContent', api.deleteContent);
export const getCoursesThunk = createAsyncThunk('admin/getCourses', api.getCourses);
export const updateProfileThunk = createAsyncThunk('admin/updateProfile', api.updateProfile);
export const updatePasswordThunk = createAsyncThunk('admin/updatePassword', api.updatePassword);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    universities: [],
    content: [],
    courses: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUniversitiesThunk.fulfilled, (state, action) => { state.universities = action.payload; })
      .addCase(getContentThunk.fulfilled, (state, action) => { state.content = action.payload; })
      .addCase(getCoursesThunk.fulfilled, (state, action) => { state.courses = action.payload; })
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

export default adminSlice.reducer;