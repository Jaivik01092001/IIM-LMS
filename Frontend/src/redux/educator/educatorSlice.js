import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './educatorApi';

export const getCoursesThunk = createAsyncThunk('educator/getCourses', api.getCourses);
export const enrollCourseThunk = createAsyncThunk('educator/enrollCourse', api.enrollCourse);
export const getMyCoursesThunk = createAsyncThunk('educator/getMyCourses', api.getMyCourses);
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
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCoursesThunk.fulfilled, (state, action) => { state.courses = action.payload; })
      .addCase(getMyCoursesThunk.fulfilled, (state, action) => { state.myCourses = action.payload; })
      .addCase(getContentThunk.fulfilled, (state, action) => { state.content = action.payload; })
      .addCase(getMyContentThunk.fulfilled, (state, action) => { state.myContent = action.payload; })
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