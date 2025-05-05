import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, let the browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Get logged in user profile
export const getLoggedInUser = async () => {
  const response = await api.get('/user/me');
  return response.data;
};

// Update logged in user profile
export const updateLoggedInUser = async (userData) => {
  // Create FormData if there's a profile image
  let data = userData;

  if (userData.profileImage) {
    const formData = new FormData();

    // Add profile image with the correct field name expected by the backend
    formData.append("profileImage", userData.profileImage);

    // Add other user data fields
    if (userData.name) formData.append('name', userData.name);
    if (userData.address) formData.append('address', userData.address);
    if (userData.zipcode) formData.append('zipcode', userData.zipcode);
    if (userData.state) formData.append('state', userData.state);
    // Removed bio field
    if (userData.category) formData.append('category', userData.category);
    if (userData.schoolName) formData.append('schoolName', userData.schoolName);

    data = formData;
  }

  const response = await api.put('/user/me', data);
  return response.data;
};

export default {
  getLoggedInUser,
  updateLoggedInUser
};
