import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./commentApi";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Async thunks
export const getCourseCommentsThunk = createAsyncThunk(
  "comment/getCourseComments",
  async (courseId, { rejectWithValue }) => {
    try {
      const data = await api.getCourseComments(courseId);
      return data;
    } catch (error) {
      console.error("Error fetching course comments:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to fetch comments"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

export const addCourseCommentThunk = createAsyncThunk(
  "comment/addCourseComment",
  async ({ courseId, text }, { rejectWithValue }) => {
    try {
      const data = await api.addCourseComment(courseId, text);
      showSuccessToast(data.message || "Comment added successfully");
      return data;
    } catch (error) {
      console.error("Error adding comment:", error);
      showErrorToast(error.response?.data?.message || "Failed to add comment");
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const updateCourseCommentThunk = createAsyncThunk(
  "comment/updateCourseComment",
  async ({ courseId, commentId, text }, { rejectWithValue }) => {
    try {
      const data = await api.updateCourseComment(courseId, commentId, text);
      showSuccessToast(data.message || "Comment updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating comment:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to update comment"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment"
      );
    }
  }
);

export const deleteCourseCommentThunk = createAsyncThunk(
  "comment/deleteCourseComment",
  async ({ courseId, commentId }, { rejectWithValue }) => {
    try {
      const data = await api.deleteCourseComment(courseId, commentId);
      showSuccessToast(data.message || "Comment deleted successfully");
      return { commentId, ...data };
    } catch (error) {
      console.error("Error deleting comment:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to delete comment"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

// Reply thunks
export const addCommentReplyThunk = createAsyncThunk(
  "comment/addCommentReply",
  async ({ courseId, commentId, text, parentReplyId }, { rejectWithValue }) => {
    try {
      const data = await api.addCommentReply(
        courseId,
        commentId,
        text,
        parentReplyId
      );
      showSuccessToast(data.message || "Reply added successfully");
      return data;
    } catch (error) {
      console.error("Error adding reply:", error);
      showErrorToast(error.response?.data?.message || "Failed to add reply");
      return rejectWithValue(
        error.response?.data?.message || "Failed to add reply"
      );
    }
  }
);

export const updateCommentReplyThunk = createAsyncThunk(
  "comment/updateCommentReply",
  async ({ courseId, commentId, replyId, text }, { rejectWithValue }) => {
    try {
      const data = await api.updateCommentReply(
        courseId,
        commentId,
        replyId,
        text
      );
      showSuccessToast(data.message || "Reply updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating reply:", error);
      showErrorToast(error.response?.data?.message || "Failed to update reply");
      return rejectWithValue(
        error.response?.data?.message || "Failed to update reply"
      );
    }
  }
);

export const deleteCommentReplyThunk = createAsyncThunk(
  "comment/deleteCommentReply",
  async ({ courseId, commentId, replyId }, { rejectWithValue }) => {
    try {
      const data = await api.deleteCommentReply(courseId, commentId, replyId);
      showSuccessToast(data.message || "Reply deleted successfully");
      return { commentId, replyId, ...data };
    } catch (error) {
      console.error("Error deleting reply:", error);
      showErrorToast(error.response?.data?.message || "Failed to delete reply");
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete reply"
      );
    }
  }
);

// Comment slice
const commentSlice = createSlice({
  name: "comment",
  initialState: {
    courseComments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get course comments
      .addCase(getCourseCommentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseCommentsThunk.fulfilled, (state, action) => {
        state.courseComments = action.payload;
        state.loading = false;
      })
      .addCase(getCourseCommentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add course comment
      .addCase(addCourseCommentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCourseCommentThunk.fulfilled, (state, action) => {
        state.courseComments = action.payload.comments;
        state.loading = false;
      })
      .addCase(addCourseCommentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update course comment
      .addCase(updateCourseCommentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseCommentThunk.fulfilled, (state, action) => {
        state.courseComments = action.payload.comments;
        state.loading = false;
      })
      .addCase(updateCourseCommentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete course comment
      .addCase(deleteCourseCommentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourseCommentThunk.fulfilled, (state, action) => {
        state.courseComments = state.courseComments.filter(
          (comment) => comment._id !== action.payload.commentId
        );
        state.loading = false;
      })
      .addCase(deleteCourseCommentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add comment reply
      .addCase(addCommentReplyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCommentReplyThunk.fulfilled, (state, action) => {
        state.courseComments = action.payload.comments;
        state.loading = false;
      })
      .addCase(addCommentReplyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update comment reply
      .addCase(updateCommentReplyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCommentReplyThunk.fulfilled, (state, action) => {
        state.courseComments = action.payload.comments;
        state.loading = false;
      })
      .addCase(updateCommentReplyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete comment reply
      .addCase(deleteCommentReplyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCommentReplyThunk.fulfilled, (state, action) => {
        // Find the comment and remove the reply
        state.courseComments = state.courseComments.map((comment) => {
          if (comment._id === action.payload.commentId) {
            return {
              ...comment,
              replies: comment.replies.filter(
                (reply) => reply._id !== action.payload.replyId
              ),
            };
          }
          return comment;
        });
        state.loading = false;
      })
      .addCase(deleteCommentReplyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default commentSlice.reducer;
