import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('accessToken') } });

export const createEducator = async (data) => {
  const response = await axios.post(`${API_URL}/university/educator`, data, getConfig());
  return response.data;
};

export const getEducators = async () => {
  const response = await axios.get(`${API_URL}/university/educators`, getConfig());
  return response.data;
};

export const getEducatorById = async (id) => {
  const response = await axios.get(`${API_URL}/university/educator/${id}`, getConfig());
  return response.data;
};

export const updateEducator = async (id, data) => {
  const response = await axios.put(`${API_URL}/university/educator/${id}`, data, getConfig());
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(`${API_URL}/university/profile`, data, getConfig());
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await axios.put(`${API_URL}/university/password`, data, getConfig());
  return response.data;
};

export const deleteEducator = async (id) => {
  const response = await axios.delete(`${API_URL}/university/educator/${id}`, getConfig());
  return response.data;
};