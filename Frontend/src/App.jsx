import React from 'react';
import "./index.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard layout
import DashboardLayout from './components/layout/DashboardLayout';

// Dashboard pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SchoolDashboard from './pages/Dashboard/SchoolDashboard';
import TutorDashboard from './pages/Dashboard/TutorDashboard';

// Dashboard sub-pages
import Courses from './pages/Dashboard/Courses';
import Organizers from './pages/Dashboard/Organizers.jsx';
import Professors from './pages/Dashboard/Professors.jsx';
import Notification from './pages/Dashboard/Notification.jsx';
import Settings from './pages/Dashboard/Settings.jsx';

const App = () => {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Dashboard routes with shared layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Admin routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/courses" element={<Courses userType="admin" />} />
            <Route path="admin/organizers" element={<Organizers />} />
            <Route path="admin/professors" element={<Professors userType="admin" />} />
            <Route path="admin/notification" element={<Notification userType="admin" />} />
            <Route path="admin/settings" element={<Settings userType="admin" />} />
            
            {/* School routes */}
            <Route path="school" element={<SchoolDashboard />} />
            <Route path="school/courses" element={<Courses userType="school" />} />
            <Route path="school/professors" element={<Professors userType="school" />} />
            <Route path="school/notification" element={<Notification userType="school" />} />
            <Route path="school/settings" element={<Settings userType="school" />} />
            
            {/* Tutor routes */}
            <Route path="tutor" element={<TutorDashboard />} />
            <Route path="tutor/courses" element={<Courses userType="tutor" />} />
            <Route path="tutor/notification" element={<Notification userType="tutor" />} />
            <Route path="tutor/settings" element={<Settings userType="tutor" />} />
            
            {/* Default redirect */}
            <Route path="" element={<Navigate to="/" replace />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;