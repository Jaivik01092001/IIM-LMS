import api from '../api';

// Get all blogs with optional filters
export const getBlogs = async (params) => {
  const response = await api.get('/blog', { params });
  return response.data;
};

// Get a single blog by ID
export const getBlogById = async (id) => {
  const response = await api.get(`/blog/${id}`);
  return response.data;
};

// Create a new blog
export const createBlog = async (data) => {
  // Configure headers based on data type
  const config = {
    headers: {
      // If data is FormData, don't set Content-Type (browser will set it with boundary)
      ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' })
    }
  };

  // Log what we're sending to help with debugging
  console.log('Creating blog with data type:', data instanceof FormData ? 'FormData' : typeof data);

  if (data instanceof FormData) {
    // Log FormData entries for debugging
    for (let [key, value] of data.entries()) {
      console.log(`FormData entry - ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }
  }

  const response = await api.post('/blog', data, config);
  return response.data;
};

// Update an existing blog
export const updateBlog = async (id, data) => {
  // Configure headers based on data type
  const config = {
    headers: {
      // If data is FormData, don't set Content-Type (browser will set it with boundary)
      ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' })
    }
  };

  // Log what we're sending to help with debugging
  console.log('Updating blog with data type:', data instanceof FormData ? 'FormData' : typeof data);

  if (data instanceof FormData) {
    // Log FormData entries for debugging
    for (let [key, value] of data.entries()) {
      console.log(`FormData entry - ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }
  }

  const response = await api.put(`/blog/${id}`, data, config);
  return response.data;
};

// Delete a blog
export const deleteBlog = async (id) => {
  const response = await api.delete(`/blog/${id}`);
  return response.data;
};