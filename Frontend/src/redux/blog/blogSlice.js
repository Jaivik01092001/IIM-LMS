import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './blogApi';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

// Thunk for getting all blogs
export const getBlogsThunk = createAsyncThunk(
  'blog/getBlogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await api.getBlogs(params);
      return data.blogs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

// Thunk for getting a single blog by ID
export const getBlogByIdThunk = createAsyncThunk(
  'blog/getBlogById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await api.getBlogById(id);
      return data.blog;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to fetch blog details');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog details');
    }
  }
);

// Thunk for creating a new blog
export const createBlogThunk = createAsyncThunk(
  'blog/createBlog',
  async (blogData, { rejectWithValue, dispatch }) => {
    try {
      const data = await api.createBlog(blogData);
      showSuccessToast(data.message || 'Blog created successfully');
      
      // Refresh the blogs list
      dispatch(getBlogsThunk());
      
      return data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to create blog');
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog');
    }
  }
);

// Thunk for updating a blog
export const updateBlogThunk = createAsyncThunk(
  'blog/updateBlog',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const id = payload.id;
      // Handle both cases: when formData is provided or when JSON data is provided
      const data = payload.formData
        ? await api.updateBlog(id, payload.formData)
        : await api.updateBlog(id, payload);
      
      showSuccessToast(data.message || 'Blog updated successfully');
      
      // Refresh the blogs list
      dispatch(getBlogsThunk());
      
      return data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update blog');
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
    }
  }
);

// Thunk for deleting a blog
export const deleteBlogThunk = createAsyncThunk(
  'blog/deleteBlog',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const data = await api.deleteBlog(id);
      showSuccessToast(data.message || 'Blog deleted successfully');
      
      // Refresh the blogs list
      dispatch(getBlogsThunk());
      
      return id; // Return the ID for state updates
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to delete blog');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState: {
    blogs: [],
    currentBlog: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getBlogsThunk
      .addCase(getBlogsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(getBlogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle getBlogByIdThunk
      .addCase(getBlogByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(getBlogByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle createBlogThunk
      .addCase(createBlogThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createBlogThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle updateBlogThunk
      .addCase(updateBlogThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlogThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBlogThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle deleteBlogThunk
      .addCase(deleteBlogThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
        // Clear currentBlog if it was deleted
        if (state.currentBlog && state.currentBlog._id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlogThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer; 