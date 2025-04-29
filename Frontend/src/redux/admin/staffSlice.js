import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./staffApi";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export const getStaffMembersThunk = createAsyncThunk(
  "admin/getStaffMembers",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getStaffMembers();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch staff members"
      );
    }
  }
);

export const getStaffMemberByIdThunk = createAsyncThunk(
  "admin/getStaffMemberById",
  async (id, { rejectWithValue }) => {
    try {
      return await api.getStaffMemberById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch staff member"
      );
    }
  }
);

export const createStaffMemberThunk = createAsyncThunk(
  "admin/createStaffMember",
  async (staffData, { rejectWithValue }) => {
    try {
      const data = await api.createStaffMember(staffData);
      showSuccessToast("Staff member created successfully");
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create staff member";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateStaffMemberThunk = createAsyncThunk(
  "admin/updateStaffMember",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.updateStaffMember(id, formData);
      showSuccessToast("Staff member updated successfully");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update staff member";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteStaffMemberThunk = createAsyncThunk(
  "admin/deleteStaffMember",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteStaffMember(id);
      showSuccessToast("Staff member deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete staff member";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    staffMembers: [],
    selectedStaffMember: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedStaffMember: (state) => {
      state.selectedStaffMember = null;
    },
    clearStaffError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all staff members
      .addCase(getStaffMembersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaffMembersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.staffMembers = action.payload;
      })
      .addCase(getStaffMembersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get staff member by ID
      .addCase(getStaffMemberByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaffMemberByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStaffMember = action.payload;
      })
      .addCase(getStaffMemberByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create staff member
      .addCase(createStaffMemberThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaffMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.staffMembers.push(action.payload);
      })
      .addCase(createStaffMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update staff member
      .addCase(updateStaffMemberThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaffMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.staffMembers.findIndex(
          (staff) => staff._id === action.payload._id
        );
        if (index !== -1) {
          state.staffMembers[index] = action.payload;
        }
        state.selectedStaffMember = action.payload;
      })
      .addCase(updateStaffMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete staff member
      .addCase(deleteStaffMemberThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaffMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.staffMembers = state.staffMembers.filter(
          (staff) => staff._id !== action.payload
        );
        if (
          state.selectedStaffMember &&
          state.selectedStaffMember._id === action.payload
        ) {
          state.selectedStaffMember = null;
        }
      })
      .addCase(deleteStaffMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedStaffMember, clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;
