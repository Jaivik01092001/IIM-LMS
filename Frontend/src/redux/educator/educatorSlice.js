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
    // Make sure we have the required parameters
    if (!quizData.courseId) {
      console.error('Missing courseId in quiz submission data');
      showErrorToast('Missing course information for quiz submission');
      return rejectWithValue('Missing courseId in quiz submission data');
    }

    const data = await api.submitQuiz(quizData);

    // Check if we have percentage or passed properties in the response
    const percentage = data.percentage || (data.data && data.data.percentage);
    const passed = data.passed || (data.data && data.data.passed);

    if (passed) {
      showSuccessToast('Quiz completed successfully! You passed!');
    } else {
      showInfoToast(`Quiz completed. Your score: ${percentage}%. Try again to improve.`);
    }

    return data.data || data; // Handle both response formats
  } catch (error) {
    console.error('Quiz submission error:', error);
    showErrorToast(error.response?.data?.msg || 'Failed to submit quiz');
    return rejectWithValue(error.response?.data?.msg || 'Failed to submit quiz');
  }
});

export const getQuizAttemptsThunk = createAsyncThunk('educator/getQuizAttempts', async (quizData, { rejectWithValue }) => {
  try {
    // Make sure we have the required parameters
    if (!quizData.courseId || !quizData.quizId) {
      console.error('Missing courseId or quizId in quiz attempts request');
      return rejectWithValue('Missing required parameters for quiz attempts');
    }

    // Log the user ID to ensure we're passing it correctly
    console.log(`Fetching quiz attempts for user: ${quizData.userId}, quiz: ${quizData.quizId}`);

    const data = await api.getQuizAttempts(quizData);

    // If no attempts found, return null
    if (!data) {
      console.log(`No attempts found for user: ${quizData.userId}, quiz: ${quizData.quizId}`);
      return null;
    }

    return data.data || data; // Handle both response formats
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    // Don't show a toast for this error as it's not user-initiated
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch quiz attempts');
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

// Module progress thunks
export const getModuleProgressThunk = createAsyncThunk('educator/getModuleProgress', async (courseId, { rejectWithValue }) => {
  try {
    const data = await api.getModuleProgress(courseId);
    return data;
  } catch (error) {
    console.error('Failed to fetch module progress:', error);
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch module progress');
  }
});

export const updateModuleProgressThunk = createAsyncThunk('educator/updateModuleProgress', async ({ courseId, progressData }, { rejectWithValue }) => {
  try {
    const data = await api.updateModuleProgress(courseId, progressData);
    return data;
  } catch (error) {
    console.error('Failed to update module progress:', error);
    return rejectWithValue(error.response?.data?.msg || 'Failed to update module progress');
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
    quizAttempts: {},  // Store quiz attempts by quizId
    certificates: [],
    currentCertificate: null,
    moduleProgress: null,
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
      .addCase(getQuizAttemptsThunk.pending, (state) => { state.loading = true; state.error = null; })

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
      .addCase(submitQuizThunk.fulfilled, (state, action) => {
        state.quizResult = action.payload;

        // Also update the quizAttempts store with the latest attempt
        if (action.meta.arg.quizId) {
          const quizId = action.meta.arg.quizId;
          state.quizAttempts[quizId] = action.payload;
        }

        state.loading = false;
      })
      .addCase(getQuizAttemptsThunk.fulfilled, (state, action) => {
        // Store the attempts by quiz ID
        const quizId = action.meta.arg.quizId;

        if (quizId) {
          // If payload is null, it means the user hasn't attempted the quiz yet
          // We still want to store this in the state to indicate we've checked
          state.quizAttempts[quizId] = action.payload;
          console.log(`Stored quiz attempt for quiz ${quizId}:`, action.payload);
        }

        state.loading = false;
      })
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
      .addCase(getQuizAttemptsThunk.rejected, (state, action) => { state.error = action.error.message; state.loading = false; })

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

      // Module progress actions
      .addCase(getModuleProgressThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getModuleProgressThunk.fulfilled, (state, action) => {
        state.moduleProgress = action.payload;
        state.loading = false;
      })
      .addCase(getModuleProgressThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      .addCase(updateModuleProgressThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateModuleProgressThunk.fulfilled, (state, action) => {
        console.log('Module progress update response:', action.payload);

        // Store the full progress object, not just the progress field
        state.moduleProgress = action.payload.progress || action.payload;
        state.loading = false;

        // Also update the overall course progress if available
        // First try to use userProgress which comes directly from the course enrollment
        const progressToUse = action.payload.userProgress !== undefined
          ? action.payload.userProgress
          : action.payload.overallProgress;

        if (progressToUse !== undefined &&
          state.courseDetail &&
          state.courseDetail.enrolledUsers &&
          state.courseDetail.enrolledUsers.length > 0) {

          console.log('Updating course progress in Redux state:', progressToUse);
          state.courseDetail.enrolledUsers[0].progress = progressToUse;

          // If progress is 100%, also update the status
          if (progressToUse === 100) {
            state.courseDetail.enrolledUsers[0].status = 'completed';
            state.courseDetail.enrolledUsers[0].completedAt = new Date().toISOString();
          }

          // Also update the progress in the myCourses list if the course exists there
          if (state.myCourses && state.myCourses.length > 0) {
            const courseId = action.meta.arg.courseId;
            const courseIndex = state.myCourses.findIndex(course => course._id === courseId);

            if (courseIndex !== -1 &&
              state.myCourses[courseIndex].enrolledUsers &&
              state.myCourses[courseIndex].enrolledUsers.length > 0) {

              // Update progress in the first enrollment (current user)
              state.myCourses[courseIndex].enrolledUsers[0].progress = progressToUse;

              // If progress is 100%, also update the status
              if (progressToUse === 100) {
                state.myCourses[courseIndex].enrolledUsers[0].status = 'completed';
                state.myCourses[courseIndex].enrolledUsers[0].completedAt = new Date().toISOString();
              }
            }
          }
        }
      })
      .addCase(updateModuleProgressThunk.rejected, (state, action) => {
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