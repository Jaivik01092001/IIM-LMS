import api from '../api';

// Role API functions
export const getAllRoles = async () => {
  const response = await api.get('/role');
  return response.data.data.roles;
};

export const getRoleById = async (id) => {
  const response = await api.get(`/role/${id}`);
  return response.data.data.role;
};

export const createRole = async (roleData) => {
  const response = await api.post('/role', roleData);
  return response.data.data.role;
};

export const updateRole = async (id, roleData) => {
  const response = await api.put(`/role/${id}`, roleData);
  return response.data.data.role;
};

export const deleteRole = async (id) => {
  const response = await api.delete(`/role/${id}`);
  return response.data;
};

export const getAllPermissions = async () => {
  const response = await api.get('/role/permissions');
  return response.data.data.permissions;
};

export const getPermissionsByCategory = async () => {
  const response = await api.get('/role/permissions/categories');
  return response.data.data.categories;
};

export const assignRoleToUser = async (userId, roleId) => {
  const response = await api.post(`/role/users/${userId}/role`, { roleId });
  return response.data.data.user;
};
