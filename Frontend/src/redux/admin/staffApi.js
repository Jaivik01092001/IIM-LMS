import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('accessToken') } });

export const getStaffMembers = async () => {
  const response = await axios.get(`${API_URL}/api/staff`, getConfig());
  return response.data.data;
};

export const getStaffMemberById = async (id) => {
  const response = await axios.get(`${API_URL}/api/staff/${id}`, getConfig());
  return response.data.data;
};

export const createStaffMember = async (data) => {
  const response = await axios.post(`${API_URL}/api/staff`, data, getConfig());
  return response.data.data;
};

export const updateStaffMember = async (id, data) => {
  const response = await axios.put(`${API_URL}/api/staff/${id}`, data, getConfig());
  return response.data.data;
};

export const deleteStaffMember = async (id) => {
  await axios.delete(`${API_URL}/api/staff/${id}`, getConfig());
  return id; // Return the ID for state updates
};

export const updateStaffMemberPassword = async (id, data) => {
  const response = await axios.put(`${API_URL}/api/staff/${id}/password`, data, getConfig());
  return response.data.data;
};
