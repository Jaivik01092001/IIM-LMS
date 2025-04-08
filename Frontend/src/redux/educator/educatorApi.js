import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

export const getCourses = async (params) => {
  const response = await axios.get(`${API_URL}/educator/courses`, { ...getConfig(), params });
  return response.data;
};

export const enrollCourse = async (id) => {
  const response = await axios.post(`${API_URL}/educator/enroll/${id}`, {}, getConfig());
  return response.data;
};

export const getMyCourses = async () => {
  const response = await axios.get(`${API_URL}/educator/my-courses`, getConfig());
  return response.data;
};

export const getCourseDetail = async (id) => {
  try {
    console.log('API call to get course detail for ID:', id);
    console.log('API URL:', `${API_URL}/educator/course/${id}`);
    console.log('Config:', getConfig());

    const response = await axios.get(`${API_URL}/educator/course/${id}`, getConfig());
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error.response || error.message || error);
    throw error;
  }
};

export const resumeCourse = async (id) => {
  const response = await axios.get(`${API_URL}/educator/resume/${id}`, getConfig());
  return response.data;
};

export const getContent = async (params) => {
  const response = await axios.get(`${API_URL}/educator/content`, { ...getConfig(), params });
  return response.data;
};

export const addComment = async (id, text) => {
  const response = await axios.post(`${API_URL}/educator/content/${id}/comment`, { text }, getConfig());
  return response.data;
};

export const getMyContent = async () => {
  const response = await axios.get(`${API_URL}/educator/my-content`, getConfig());
  return response.data;
};

export const createContent = async (formData) => {
  const response = await axios.post(`${API_URL}/educator/content`, formData, {
    ...getConfig(),
    headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitQuiz = async ({ id, answers }) => {
  const response = await axios.post(`${API_URL}/educator/quiz/${id}`, { answers }, getConfig());
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(`${API_URL}/educator/profile`, data, getConfig());
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await axios.put(`${API_URL}/educator/password`, data, getConfig());
  return response.data;
};

export const updateProgress = async ({ courseId, progress }) => {
  const response = await axios.put(`${API_URL}/educator/course/${courseId}/progress`, { progress }, getConfig());
  return response.data;
};