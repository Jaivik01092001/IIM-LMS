import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';
import educatorSlice from './educator/educatorSlice';
import universitySlice from './university/universitySlice';
import adminSlice from './admin/adminSlice';
import roleSlice from './role/roleSlice';
import staffSlice from './admin/staffSlice';
import blogSlice from './blog/blogSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    educator: educatorSlice,
    university: universitySlice,
    admin: adminSlice,
    role: roleSlice,
    staff: staffSlice,
    blog: blogSlice,
  },
});

export default store;