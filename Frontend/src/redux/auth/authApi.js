import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, data);
  return response.data;
};