import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './adminApi';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';

export const getUsersThunk = createAsyncThunk('admin/getUsers', async () => {
  try {
    const data = await api.getUsers();
    //  console.log('getUsersThunk response:', data);
    return data;
  } catch (error) {
    console.error('Error in getUsersThunk:', error);
    throw error;
  }
});

export const getEducatorsThunk = createAsyncThunk('admin/getEducators', async () => {
  try {
    const data = await api.getEducators();
    return data;
  } catch (error) {
    console.error('Error in getEducatorsThunk:', error);
    throw error;
  }
});

export const getEducatorByIdThunk = createAsyncThunk(
  'admin/getEducatorById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await api.getEducatorById(id);
      return data;
    } catch (error) {
      console.error('Error in getEducatorByIdThunk:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch educator details');
    }
  }
);

export const updateEducatorThunk = createAsyncThunk(
  'admin/updateEducator',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const id = payload.id;
      // Handle both cases: when formData is provided or when individual fields like status are provided
      const data = payload.formData
        ? await api.updateEducator(id, payload.formData)
        : await api.updateEducator(id, payload);

      showSuccessToast(data.msg || 'Educator updated successfully');

      // Refresh the educators list to ensure data consistency
      dispatch(getEducatorsThunk());

      return data.educator || data; // Handle both response formats
    } catch (error) {
      showErrorToast(error.response?.data?.msg || 'Failed to update educator');
      return rejectWithValue(error.response?.data?.msg || 'Failed to update educator');
    }
  }
);

export const getUniversitiesThunk = createAsyncThunk('admin/getUniversities', api.getUniversities);

export const getUniversityByIdThunk = createAsyncThunk(
  'admin/getUniversityById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await api.getUniversityById(id);
      return data;
    } catch (error) {
      showErrorToast(error.response?.data?.msg || 'Failed to fetch university details');
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch university details');
    }
  }
);

export const createUniversityThunk = createAsyncThunk('admin/createUniversity', async (universityData, { rejectWithValue }) => {
  try {
    const data = await api.createUniversity(universityData);
    showSuccessToast(data.msg || 'University created successfully');
    return data;
  } catch (error) {
    // Check for specific error messages from the backend
    const errorMessage = error.response?.data?.message || 'Failed to create university';
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

export const updateUniversityThunk = createAsyncThunk('admin/updateUniversity', async ({ id, ...universityData }, { rejectWithValue, dispatch }) => {
  try {
    const data = await api.updateUniversity(id, universityData);
    showSuccessToast(data.msg || 'University updated successfully');

    // Refresh the universities list to ensure data consistency
    dispatch(getUniversitiesThunk());

    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update university');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update university');
  }
});

export const deleteUniversityThunk = createAsyncThunk('admin/deleteUniversity', async (id, { rejectWithValue }) => {
  try {
    const data = await api.deleteUniversity(id);
    showSuccessToast(data.msg || 'University deleted successfully');
    return id; // Return the ID for state updates
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to delete university');
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete university');
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

// Course thunks
export const getCourseThunk = createAsyncThunk('admin/getCourse', api.getCourse);

export const createCourseThunk = createAsyncThunk('admin/createCourse', async (courseData, { rejectWithValue }) => {
  try {
    const data = await api.createCourse(courseData);
    showSuccessToast('Course created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to create course');
    return rejectWithValue(error.response?.data?.message || 'Failed to create course');
  }
});

export const updateCourseThunk = createAsyncThunk('admin/updateCourse', async ({ id, ...courseData }, { rejectWithValue }) => {
  try {
    const data = await api.updateCourse(id, courseData);
    showSuccessToast('Course updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to update course');
    return rejectWithValue(error.response?.data?.message || 'Failed to update course');
  }
});

export const deleteCourseThunk = createAsyncThunk('admin/deleteCourse', async (id, { rejectWithValue }) => {
  try {
    const data = await api.deleteCourse(id);
    showSuccessToast('Course deleted successfully');
    return id; // Return the ID for state updates
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to delete course');
    return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
  }
});

export const addContentToCourseThunk = createAsyncThunk('admin/addContentToCourse', async (data, { rejectWithValue }) => {
  try {
    const response = await api.addContentToCourse(data);
    showSuccessToast('Content added to course successfully');
    return response;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to add content to course');
    return rejectWithValue(error.response?.data?.message || 'Failed to add content to course');
  }
});

export const addQuizToCourseThunk = createAsyncThunk('admin/addQuizToCourse', async (data, { rejectWithValue }) => {
  try {
    const response = await api.addQuizToCourse(data);
    showSuccessToast('Quiz added to course successfully');
    return response;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to add quiz to course');
    return rejectWithValue(error.response?.data?.message || 'Failed to add quiz to course');
  }
});

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

// Quiz thunks
export const getQuizzesThunk = createAsyncThunk('admin/getQuizzes', api.getQuizzes);

export const getQuizThunk = createAsyncThunk('admin/getQuiz', api.getQuiz);

export const createQuizThunk = createAsyncThunk('admin/createQuiz', async (quizData, { rejectWithValue }) => {
  try {
    const data = await api.createQuiz(quizData);
    showSuccessToast('Quiz created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to create quiz');
    return rejectWithValue(error.response?.data?.message || 'Failed to create quiz');
  }
});

export const updateQuizThunk = createAsyncThunk('admin/updateQuiz', async ({ id, ...quizData }, { rejectWithValue }) => {
  try {
    const data = await api.updateQuiz(id, quizData);
    showSuccessToast('Quiz updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Failed to update quiz');
    return rejectWithValue(error.response?.data?.message || 'Failed to update quiz');
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
    users: [],
    educators: [],
    currentEducator: null,
    universities: [],
    currentUniversity: null,
    content: [],
    courses: [],
    currentCourse: null,
    quizzes: [],
    currentQuiz: null,
    pages: [],
    currentPage: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsersThunk.fulfilled, (state, action) => { state.users = action.payload; })
      .addCase(getEducatorsThunk.fulfilled, (state, action) => { state.educators = action.payload; })
      .addCase(getEducatorByIdThunk.fulfilled, (state, action) => { state.currentEducator = action.payload; })
      .addCase(updateEducatorThunk.fulfilled, (state, action) => { state.currentEducator = action.payload; })
      .addCase(getUniversitiesThunk.fulfilled, (state, action) => { state.universities = action.payload; })
      .addCase(getUniversityByIdThunk.fulfilled, (state, action) => { state.currentUniversity = action.payload; })
      .addCase(createUniversityThunk.fulfilled, (state, action) => { state.universities.push(action.payload); })
      .addCase(updateUniversityThunk.fulfilled, (state, action) => {
        const index = state.universities.findIndex(uni => uni._id === action.payload._id);
        if (index !== -1) state.universities[index] = action.payload;
      })
      .addCase(deleteUniversityThunk.fulfilled, (state, action) => {
        state.universities = state.universities.filter(uni => uni._id !== action.payload);
      })
      .addCase(getContentThunk.fulfilled, (state, action) => { state.content = action.payload; })
      .addCase(getCoursesThunk.fulfilled, (state, action) => { state.courses = action.payload; })
      .addCase(getCourseThunk.fulfilled, (state, action) => { state.currentCourse = action.payload; })
      .addCase(createCourseThunk.fulfilled, (state, action) => { state.courses.push(action.payload); })
      .addCase(updateCourseThunk.fulfilled, (state, action) => {
        const index = state.courses.findIndex(course => course._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
        state.currentCourse = action.payload;
      })
      .addCase(deleteCourseThunk.fulfilled, (state, action) => {
        state.courses = state.courses.filter(course => course._id !== action.meta.arg);
        if (state.currentCourse && state.currentCourse._id === action.meta.arg) {
          state.currentCourse = null;
        }
      })
      .addCase(getQuizzesThunk.fulfilled, (state, action) => { state.quizzes = action.payload; })
      .addCase(getQuizThunk.fulfilled, (state, action) => { state.currentQuiz = action.payload; })
      .addCase(createQuizThunk.fulfilled, (state, action) => { state.quizzes.push(action.payload); })
      .addCase(updateQuizThunk.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id);
        if (index !== -1) state.quizzes[index] = action.payload;
        state.currentQuiz = action.payload;
      })
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