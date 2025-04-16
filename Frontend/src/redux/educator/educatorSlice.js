import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './educatorApi';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';

export const getCoursesThunk = createAsyncThunk('educator/getCourses', api.getCourses);
export const enrollCourseThunk = createAsyncThunk('educator/enrollCourse', async (id, { rejectWithValue }) => {
  try {
    const data = await api.enrollCourse(id);
    showSuccessToast(data.msg || 'Successfully enrolled in course');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to enroll in course');
    return rejectWithValue(error.response?.data?.msg || 'Failed to enroll in course');
  }
});
export const getMyCoursesThunk = createAsyncThunk('educator/getMyCourses', api.getMyCourses);
export const getCourseDetailThunk = createAsyncThunk('educator/getCourseDetail', api.getCourseDetail);
export const resumeCourseThunk = createAsyncThunk('educator/resumeCourse', api.resumeCourse);
export const getContentThunk = createAsyncThunk('educator/getContent', api.getContent);
export const addCommentThunk = createAsyncThunk('educator/addComment', async (commentData, { rejectWithValue }) => {
  try {
    const data = await api.addComment(commentData);
    showSuccessToast(data.msg || 'Comment added successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to add comment');
    return rejectWithValue(error.response?.data?.msg || 'Failed to add comment');
  }
});
export const getMyContentThunk = createAsyncThunk('educator/getMyContent', api.getMyContent);
export const createContentThunk = createAsyncThunk('educator/createContent', async (formData, { rejectWithValue }) => {
  try {
    const data = await api.createContent(formData);
    showSuccessToast(data.msg || 'Content created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to create content');
    return rejectWithValue(error.response?.data?.msg || 'Failed to create content');
  }
});

export const submitQuizThunk = createAsyncThunk('educator/submitQuiz', async (quizData, { rejectWithValue }) => {
  try {
    const data = await api.submitQuiz(quizData);
    if (data.passed) {
      showSuccessToast('Quiz completed successfully! You passed!');
    } else {
      showInfoToast(`Quiz completed. Your score: ${data.percentage}%. Try again to improve.`);
    }
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to submit quiz');
    return rejectWithValue(error.response?.data?.msg || 'Failed to submit quiz');
  }
});

export const updateProfileThunk = createAsyncThunk('educator/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const data = await api.updateProfile(profileData);
    showSuccessToast(data.msg || 'Profile updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update profile');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update profile');
  }
});

export const updatePasswordThunk = createAsyncThunk('educator/updatePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const data = await api.updatePassword(passwordData);
    showSuccessToast(data.msg || 'Password updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update password');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update password');
  }
});
export const updateProgressThunk = createAsyncThunk('educator/updateProgress', async (progressData, { rejectWithValue }) => {
  try {
    const data = await api.updateProgress(progressData);
    // No toast for progress updates as they happen frequently and would be annoying
    return data;
  } catch (error) {
    // Only show error toast for progress update failures
    showErrorToast(error.response?.data?.msg || 'Failed to update progress');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update progress');
  }
});

const educatorSlice = createSlice({
  name: 'educator',
  initialState: {
    courses: [],
    myCourses: [],
    content: [],
    myContent: [],
    courseDetail: null,
    quizResult: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Loading states
      .addCase(getCoursesThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyCoursesThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getContentThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyContentThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getCourseDetailThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitQuizThunk.pending, (state) => { state.loading = true; state.error = null; })

      // Success states
      .addCase(getCoursesThunk.fulfilled, (state, action) => { state.courses = action.payload; state.loading = false; })
      .addCase(getMyCoursesThunk.fulfilled, (state, action) => { state.myCourses = action.payload; state.loading = false; })
      .addCase(getContentThunk.fulfilled, (state, action) => { state.content = action.payload; state.loading = false; })
      .addCase(getMyContentThunk.fulfilled, (state, action) => { state.myContent = action.payload; state.loading = false; })
      .addCase(getCourseDetailThunk.fulfilled, (state, action) => {
        console.log('Course detail fulfilled:', action.payload);
        state.courseDetail = action.payload;
        state.loading = false;
      })
      .addCase(submitQuizThunk.fulfilled, (state, action) => { state.quizResult = action.payload; state.loading = false; })
      .addCase(updateProgressThunk.fulfilled, (state, action) => {
        if (state.courseDetail && state.courseDetail.enrolledUsers && state.courseDetail.enrolledUsers.length > 0) {
          state.courseDetail.enrolledUsers[0].progress = action.payload.progress;
        }
      })

      // Error states
      .addCase(getCoursesThunk.rejected, (state, action) => { state.error = action.error.message; state.loading = false; })
      .addCase(getMyCoursesThunk.rejected, (state, action) => { state.error = action.error.message; state.loading = false; })
      .addCase(getContentThunk.rejected, (state, action) => { state.error = action.error.message; state.loading = false; })
      .addCase(getMyContentThunk.rejected, (state, action) => { state.error = action.error.message; state.loading = false; })
      .addCase(getCourseDetailThunk.rejected, (state, action) => {
        console.error('Course detail rejected:', action.error.message);
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(submitQuizThunk.rejected, (state, action) => { state.error = action.error.message; state.loading = false; })
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

export default educatorSlice.reducer;