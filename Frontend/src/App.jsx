import React from 'react';
import "./index.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SmoothScrollProvider } from './context/SmoothScrollContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CourseDetail from './pages/CourseDetail';

// Dashboard layout
import DashboardLayout from './components/layout/DashboardLayout';

// Dashboard pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SchoolDashboard from './pages/Dashboard/SchoolDashboard';
import TutorDashboard from './pages/Dashboard/TutorDashboard';

// Dashboard sub-pages
import Courses from './pages/Courses';
import Schools from './pages/Schools.jsx';
import Educators from './pages/Educators.jsx';
import Notification from './pages/Notification.jsx';
import Settings from './pages/Settings.jsx';

const App = () => {
  return (
    <SmoothScrollProvider>
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
          <Route path="/course/:id" element={<CourseDetail />} />

          {/* Dashboard routes with shared layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Admin routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/courses" element={<Courses userType="admin" />} />
            <Route path="admin/courses/:id" element={<CourseDetail />} />
            <Route path="admin/schools" element={<Schools />} />
            <Route path="admin/educators" element={<Educators userType="admin" />} />
            <Route path="admin/notification" element={<Notification userType="admin" />} />
            <Route path="admin/settings" element={<Settings userType="admin" />} />

            {/* School routes */}
            <Route path="school" element={<SchoolDashboard />} />
            <Route path="school/courses" element={<Courses userType="school" />} />
            <Route path="school/courses/:id" element={<CourseDetail />} />
            <Route path="school/educators" element={<Educators userType="school" />} />
            <Route path="school/notification" element={<Notification userType="school" />} />
            <Route path="school/settings" element={<Settings userType="school" />} />

            {/* Tutor routes */}
            <Route path="tutor" element={<TutorDashboard />} />
            <Route path="tutor/courses" element={<Courses userType="tutor" />} />
            <Route path="tutor/courses/:id" element={<CourseDetail />} />
            <Route path="tutor/notification" element={<Notification userType="tutor" />} />
            <Route path="tutor/settings" element={<Settings userType="tutor" />} />

            {/* Default redirect */}
            <Route path="" element={<Navigate to="/" replace />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SmoothScrollProvider>
  );
}

export default App;