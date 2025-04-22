import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import * as api from './roleApi';

// Async thunks
export const getRolesThunk = createAsyncThunk('role/getRoles', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getAllRoles();
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to fetch roles');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch roles');
  }
});

export const getRoleByIdThunk = createAsyncThunk('role/getRoleById', async (id, { rejectWithValue }) => {
  try {
    const data = await api.getRoleById(id);
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to fetch role');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch role');
  }
});

export const createRoleThunk = createAsyncThunk('role/createRole', async (roleData, { rejectWithValue }) => {
  try {
    const data = await api.createRole(roleData);
    showSuccessToast('Role created successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to create role');
    return rejectWithValue(error.response?.data?.msg || 'Failed to create role');
  }
});

export const updateRoleThunk = createAsyncThunk('role/updateRole', async ({ id, roleData }, { rejectWithValue }) => {
  try {
    const data = await api.updateRole(id, roleData);
    showSuccessToast('Role updated successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to update role');
    return rejectWithValue(error.response?.data?.msg || 'Failed to update role');
  }
});

export const deleteRoleThunk = createAsyncThunk('role/deleteRole', async (id, { rejectWithValue }) => {
  try {
    await api.deleteRole(id);
    showSuccessToast('Role deleted successfully');
    return id;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to delete role');
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete role');
  }
});

export const getPermissionsThunk = createAsyncThunk('role/getPermissions', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getAllPermissions();
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to fetch permissions');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch permissions');
  }
});

export const getPermissionsByCategoryThunk = createAsyncThunk('role/getPermissionsByCategory', async (_, { rejectWithValue }) => {
  try {
    const data = await api.getPermissionsByCategory();
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to fetch permissions by category');
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch permissions by category');
  }
});

export const assignRoleToUserThunk = createAsyncThunk('role/assignRoleToUser', async ({ userId, roleId }, { rejectWithValue }) => {
  try {
    const data = await api.assignRoleToUser(userId, roleId);
    showSuccessToast('Role assigned successfully');
    return data;
  } catch (error) {
    showErrorToast(error.response?.data?.msg || 'Failed to assign role');
    return rejectWithValue(error.response?.data?.msg || 'Failed to assign role');
  }
});

// Role slice
const roleSlice = createSlice({
  name: 'role',
  initialState: {
    roles: [],
    currentRole: null,
    permissions: [],
    permissionsByCategory: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all roles
      .addCase(getRolesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRolesThunk.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(getRolesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get role by ID
      .addCase(getRoleByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoleByIdThunk.fulfilled, (state, action) => {
        state.currentRole = action.payload;
        state.loading = false;
      })
      .addCase(getRoleByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create role
      .addCase(createRoleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        state.roles.push(action.payload);
        state.loading = false;
      })
      .addCase(createRoleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update role
      .addCase(updateRoleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoleThunk.fulfilled, (state, action) => {
        const index = state.roles.findIndex(role => role._id === action.payload._id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        state.currentRole = action.payload;
        state.loading = false;
      })
      .addCase(updateRoleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete role
      .addCase(deleteRoleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoleThunk.fulfilled, (state, action) => {
        state.roles = state.roles.filter(role => role._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteRoleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get all permissions
      .addCase(getPermissionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionsThunk.fulfilled, (state, action) => {
        state.permissions = action.payload;
        state.loading = false;
      })
      .addCase(getPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get permissions by category
      .addCase(getPermissionsByCategoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionsByCategoryThunk.fulfilled, (state, action) => {
        state.permissionsByCategory = action.payload;
        state.loading = false;
      })
      .addCase(getPermissionsByCategoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
