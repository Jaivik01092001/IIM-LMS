import React from 'react';
import "./index.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EducatorDashboard from './pages/EducatorDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard'; // Assuming these components exist
import SchoolDashboard from './pages/SchoolDashboard';
import TutorDashboard from './pages/TutorDashboard';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard/*" element={<Navigate to="/" />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/school" element={<SchoolDashboard />} />
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;