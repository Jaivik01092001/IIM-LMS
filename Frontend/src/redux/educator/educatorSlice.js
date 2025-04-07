import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './educatorApi';

export const getCoursesThunk = createAsyncThunk('educator/getCourses', api.getCourses);
export const enrollCourseThunk = createAsyncThunk('educator/enrollCourse', api.enrollCourse);
export const getMyCoursesThunk = createAsyncThunk('educator/getMyCourses', api.getMyCourses);
export const getCourseDetailThunk = createAsyncThunk('educator/getCourseDetail', api.getCourseDetail);
export const resumeCourseThunk = createAsyncThunk('educator/resumeCourse', api.resumeCourse);
export const getContentThunk = createAsyncThunk('educator/getContent', api.getContent);
export const addCommentThunk = createAsyncThunk('educator/addComment', api.addComment);
export const getMyContentThunk = createAsyncThunk('educator/getMyContent', api.getMyContent);
export const createContentThunk = createAsyncThunk('educator/createContent', api.createContent);
export const submitQuizThunk = createAsyncThunk('educator/submitQuiz', api.submitQuiz);
export const updateProfileThunk = createAsyncThunk('educator/updateProfile', api.updateProfile);
export const updatePasswordThunk = createAsyncThunk('educator/updatePassword', api.updatePassword);

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