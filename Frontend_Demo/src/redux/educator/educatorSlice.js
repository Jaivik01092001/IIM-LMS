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

// Certificate-related thunks
export const getMyCertificatesThunk = createAsyncThunk('educator/getMyCertificates', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getMyCertificates();
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to fetch certificates');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch certificates');
  }
});

export const generateCertificateThunk = createAsyncThunk('educator/generateCertificate', async (courseId, { rejectWithValue }) => {
  try {
    const data = await api.generateCertificate(courseId);
    showSuccessToast('Certificate generated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to generate certificate');
    return rejectWithValue(error.response?.data?.msg || 'Failed to generate certificate');
  }
});

export const getCertificateThunk = createAsyncThunk('educator/getCertificate', async (id, { rejectWithValue }) => {
  try {
    const data = await api.getCertificate(id);
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to fetch certificate');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch certificate');
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
    certificates: [],
    currentCertificate: null,
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
          // Update progress in the course detail
          state.courseDetail.enrolledUsers[0].progress = action.payload.progress;
          state.courseDetail.enrolledUsers[0].status = action.payload.status;

          // If the course is completed, update the status and completedAt date
          if (action.payload.status === 'completed') {
            state.courseDetail.enrolledUsers[0].completedAt = new Date().toISOString();
          }

          // Also update the progress in the myCourses list if the course exists there
          if (state.myCourses && state.myCourses.length > 0) {
            const courseIndex = state.myCourses.findIndex(course => course._id === state.courseDetail._id);
            if (courseIndex !== -1 && state.myCourses[courseIndex].enrolledUsers && state.myCourses[courseIndex].enrolledUsers.length > 0) {
              // Find the user's enrollment in the course
              const userEnrollmentIndex = state.myCourses[courseIndex].enrolledUsers.findIndex(
                enrollment => enrollment.user === state.courseDetail.enrolledUsers[0].user
              );

              if (userEnrollmentIndex !== -1) {
                // Update progress in myCourses
                state.myCourses[courseIndex].enrolledUsers[userEnrollmentIndex].progress = action.payload.progress;
                state.myCourses[courseIndex].enrolledUsers[userEnrollmentIndex].status = action.payload.status;

                if (action.payload.status === 'completed') {
                  state.myCourses[courseIndex].enrolledUsers[userEnrollmentIndex].completedAt = new Date().toISOString();
                }
              }
            }
          }
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

      // Certificate actions
      .addCase(getMyCertificatesThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyCertificatesThunk.fulfilled, (state, action) => {
        state.certificates = action.payload;
        state.loading = false;
      })
      .addCase(getMyCertificatesThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      .addCase(generateCertificateThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(generateCertificateThunk.fulfilled, (state, action) => {
        state.currentCertificate = action.payload;
        if (!state.certificates.find(cert => cert._id === action.payload._id)) {
          state.certificates.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(generateCertificateThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      .addCase(getCertificateThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getCertificateThunk.fulfilled, (state, action) => {
        state.currentCertificate = action.payload;
        state.loading = false;
      })
      .addCase(getCertificateThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
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

export default educatorSlice.reducer;