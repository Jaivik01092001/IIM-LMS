import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './adminApi';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';

export const getUniversitiesThunk = createAsyncThunk('admin/getUniversities', api.getUniversities);
export const createUniversityThunk = createAsyncThunk('admin/createUniversity', async (universityData, { rejectWithValue }) => {
  try {
    const data = await api.createUniversity(universityData);
    showSuccessToast(data.msg || 'University created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to create university');
    return rejectWithValue(error.response?.data?.msg || 'Failed to create university');
  }
});

export const updateUniversityThunk = createAsyncThunk('admin/updateUniversity', async ({ id, ...universityData }, { rejectWithValue }) => {
  try {
    const data = await api.updateUniversity(id, universityData);
    showSuccessToast(data.msg || 'University updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update university');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update university');
  }
});
export const getContentThunk = createAsyncThunk('admin/getContent', api.getContent);
export const createContentThunk = createAsyncThunk('admin/createContent', async (contentData, { rejectWithValue }) => {
  try {
    const data = await api.createContent(contentData);
    showSuccessToast(data.msg || 'Content created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to create content');
    return rejectWithValue(error.response?.data?.msg || 'Failed to create content');
  }
});

export const updateContentThunk = createAsyncThunk('admin/updateContent', async ({ id, ...contentData }, { rejectWithValue }) => {
  try {
    const data = await api.updateContent(id, contentData);
    showSuccessToast(data.msg || 'Content updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update content');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update content');
  }
});

export const approveContentThunk = createAsyncThunk('admin/approveContent', async (id, { rejectWithValue }) => {
  try {
    const data = await api.approveContent(id);
    showSuccessToast(data.msg || 'Content approved successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to approve content');
    return rejectWithValue(error.response?.data?.msg || 'Failed to approve content');
  }
});

export const rejectContentThunk = createAsyncThunk('admin/rejectContent', async (id, { rejectWithValue }) => {
  try {
    const data = await api.rejectContent(id);
    showSuccessToast(data.msg || 'Content rejected');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to reject content');
    return rejectWithValue(error.response?.data?.msg || 'Failed to reject content');
  }
});

export const deleteContentThunk = createAsyncThunk('admin/deleteContent', async (id, { rejectWithValue }) => {
  try {
    const data = await api.deleteContent(id);
    showSuccessToast(data.msg || 'Content deleted successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to delete content');
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete content');
  }
});
export const getCoursesThunk = createAsyncThunk('admin/getCourses', api.getCourses);
export const updateProfileThunk = createAsyncThunk('admin/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const data = await api.updateProfile(profileData);
    showSuccessToast(data.msg || 'Profile updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update profile');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update profile');
  }
});

export const updatePasswordThunk = createAsyncThunk('admin/updatePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const data = await api.updatePassword(passwordData);
    showSuccessToast(data.msg || 'Password updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update password');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update password');
  }
});

// CMS Thunks
export const getPagesThunk = createAsyncThunk('admin/getPages', api.getPages);
export const getPageThunk = createAsyncThunk('admin/getPage', api.getPage);

export const createPageThunk = createAsyncThunk('admin/createPage', async (pageData, { rejectWithValue }) => {
  try {
    const data = await api.createPage(pageData);
    showSuccessToast(data.msg || 'Page created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to create page');
    return rejectWithValue(error.response?.data?.msg || 'Failed to create page');
  }
});

export const updatePageThunk = createAsyncThunk('admin/updatePage', async ({ id, ...pageData }, { rejectWithValue }) => {
  try {
    const data = await api.updatePage({ id, ...pageData });
    showSuccessToast(data.msg || 'Page updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update page');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update page');
  }
});

export const deletePageThunk = createAsyncThunk('admin/deletePage', async (id, { rejectWithValue }) => {
  try {
    const data = await api.deletePage(id);
    showSuccessToast(data.msg || 'Page deleted successfully');
    return id; // Return the ID for state updates
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to delete page');
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete page');
  }
});

export const publishPageThunk = createAsyncThunk('admin/publishPage', async (id, { rejectWithValue }) => {
  try {
    const data = await api.publishPage(id);
    showSuccessToast(data.msg || 'Page published successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to publish page');
    return rejectWithValue(error.response?.data?.msg || 'Failed to publish page');
  }
});

export const unpublishPageThunk = createAsyncThunk('admin/unpublishPage', async (id, { rejectWithValue }) => {
  try {
    const data = await api.unpublishPage(id);
    showSuccessToast(data.msg || 'Page unpublished');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to unpublish page');
    return rejectWithValue(error.response?.data?.msg || 'Failed to unpublish page');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    universities: [],
    content: [],
    courses: [],
    pages: [],
    currentPage: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUniversitiesThunk.fulfilled, (state, action) => { state.universities = action.payload; })
      .addCase(getContentThunk.fulfilled, (state, action) => { state.content = action.payload; })
      .addCase(getCoursesThunk.fulfilled, (state, action) => { state.courses = action.payload; })
      .addCase(getPagesThunk.fulfilled, (state, action) => { state.pages = action.payload; })
      .addCase(getPageThunk.fulfilled, (state, action) => { state.currentPage = action.payload; })
      .addCase(createPageThunk.fulfilled, (state, action) => { state.pages.push(action.payload); })
      .addCase(updatePageThunk.fulfilled, (state, action) => {
        const index = state.pages.findIndex(page => page._id === action.payload._id);
        if (index !== -1) state.pages[index] = action.payload;
        state.currentPage = action.payload;
      })
      .addCase(deletePageThunk.fulfilled, (state, action) => {
        state.pages = state.pages.filter(page => page._id !== action.meta.arg);
      })
      .addCase(publishPageThunk.fulfilled, (state, action) => {
        const index = state.pages.findIndex(page => page._id === action.payload._id);
        if (index !== -1) state.pages[index] = action.payload;
        state.currentPage = action.payload;
      })
      .addCase(unpublishPageThunk.fulfilled, (state, action) => {
        const index = state.pages.findIndex(page => page._id === action.payload._id);
        if (index !== -1) state.pages[index] = action.payload;
        state.currentPage = action.payload;
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

export default adminSlice.reducer;