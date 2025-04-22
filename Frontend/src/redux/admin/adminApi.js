import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('accessToken') } });

export const getUniversities = async () => {
  const response = await axios.get(`${API_URL}/admin/universities`, getConfig());
  return response.data;
};

export const getUniversityById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/university/${id}`, getConfig());
  return response.data;
};

export const createUniversity = async (data) => {
  const response = await axios.post(`${API_URL}/admin/university`, data, getConfig());
  return response.data;
};

export const updateUniversity = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/university/${id}`, data, getConfig());
  return response.data;
};

export const deleteUniversity = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/university/${id}`, getConfig());
  return response.data;
};

export const getContent = async (params) => {
  const response = await axios.get(`${API_URL}/admin/content`, { ...getConfig(), params });
  return response.data;
};

export const createContent = async (formData) => {
  const response = await axios.post(`${API_URL}/admin/content`, formData, {
    ...getConfig(),
    headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateContent = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/content/${id}`, data, getConfig());
  return response.data;
};

export const approveContent = async (id) => {
  const response = await axios.put(`${API_URL}/admin/content/approve/${id}`, {}, getConfig());
  return response.data;
};

export const rejectContent = async (id) => {
  const response = await axios.put(`${API_URL}/admin/content/reject/${id}`, {}, getConfig());
  return response.data;
};

export const deleteContent = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/content/${id}`, getConfig());
  return response.data;
};

export const getCourses = async () => {
  const response = await axios.get(`${API_URL}/admin/courses`, getConfig());
  return response.data;
};

export const getCourse = async (id) => {
  const response = await axios.get(`${API_URL}/admin/course/${id}`, getConfig());
  return response.data;
};

export const createCourse = async (data) => {
  const response = await axios.post(`${API_URL}/admin/course`, data, getConfig());
  return response.data;
};

export const updateCourse = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/course/${id}`, data, getConfig());
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/course/${id}`, getConfig());
  return response.data;
};

export const addContentToCourse = async (data) => {
  const response = await axios.post(`${API_URL}/admin/course/content`, data, getConfig());
  return response.data;
};

export const addQuizToCourse = async (data) => {
  const response = await axios.post(`${API_URL}/admin/course/quiz`, data, getConfig());
  return response.data;
};

export const getQuizzes = async () => {
  const response = await axios.get(`${API_URL}/admin/quizzes`, getConfig());
  return response.data;
};

export const getQuiz = async (id) => {
  const response = await axios.get(`${API_URL}/admin/quiz/${id}`, getConfig());
  return response.data;
};

export const createQuiz = async (data) => {
  const response = await axios.post(`${API_URL}/admin/quiz`, data, getConfig());
  return response.data;
};

export const updateQuiz = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/quiz/${id}`, data, getConfig());
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(`${API_URL}/admin/profile`, data, getConfig());
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await axios.put(`${API_URL}/admin/password`, data, getConfig());
  return response.data;
};

// CMS API calls
export const getPages = async () => {
  const response = await axios.get(`${API_URL}/cms/admin/pages`, getConfig());
  return response.data;
};

export const getPage = async (id) => {
  const response = await axios.get(`${API_URL}/cms/admin/page/${id}`, getConfig());
  return response.data;
};

export const createPage = async (data) => {
  const response = await axios.post(`${API_URL}/cms/admin/page`, data, getConfig());
  return response.data;
};

export const updatePage = async ({ id, ...data }) => {
  const response = await axios.put(`${API_URL}/cms/admin/page/${id}`, data, getConfig());
  return response.data;
};

export const deletePage = async (id) => {
  const response = await axios.delete(`${API_URL}/cms/admin/page/${id}`, getConfig());
  return response.data;
};

export const publishPage = async (id) => {
  const response = await axios.put(`${API_URL}/cms/admin/page/${id}/publish`, {}, getConfig());
  return response.data;
};

export const unpublishPage = async (id) => {
  const response = await axios.put(`${API_URL}/cms/admin/page/${id}/unpublish`, {}, getConfig());
  return response.data;
};