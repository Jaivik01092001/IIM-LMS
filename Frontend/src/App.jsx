import React, { Suspense } from "react";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CourseDetail from "./pages/CourseDetail";
// Dashboard layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard pages
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import SchoolDashboard from "./pages/Dashboard/SchoolDashboard";
import TutorDashboard from "./pages/Dashboard/TutorDashboard";

// Dashboard sub-pages
import Courses from "./pages/Courses";
import Schools from "./pages/Schools.jsx";
// Import SchoolDetails dynamically to avoid casing issues
const SchoolDetails = React.lazy(() => import("./pages/SchoolDetails.jsx"));
import SchoolAccountForm from "./pages/SchoolAccountForm.jsx";
import Educators from "./pages/Educators.jsx";
import EducatorDetails from "./pages/EducatorDetails.jsx";
import EducatorAccountForm from "./pages/EducatorAccountForm.jsx";
import CourseForm from "./pages/CourseForm.jsx";
import Notification from "./pages/Notification.jsx";
import RolePermission from "./pages/RolePermission.jsx";

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
            <Route
              path="admin/courses"
              element={<Courses userType="admin" />}
            />
            <Route path="admin/courses/add" element={<CourseForm />} />
            <Route path="admin/courses/edit/:id" element={<CourseForm />} />
            <Route path="admin/courses/:id" element={<CourseDetail />} />
            <Route path="admin/schools" element={<Schools />} />
            <Route
              path="admin/school-details"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <SchoolDetails />
                </Suspense>
              }
            />
            <Route
              path="admin/school-account-form"
              element={<SchoolAccountForm />}
            />
            <Route
              path="admin/educators"
              element={<Educators userType="admin" />}
            />
            <Route
              path="admin/educator-details"
              element={<EducatorDetails />}
            />
            <Route
              path="admin/educator-account-form"
              element={<EducatorAccountForm />}
            />
            <Route
              path="admin/notification"
              element={<Notification userType="admin" />}
            />
            <Route
              path="admin/role-permission"
              element={<RolePermission />}
            />

            {/* School routes */}
            <Route path="school" element={<SchoolDashboard />} />
            <Route
              path="school/courses"
              element={<Courses userType="school" />}
            />
            <Route path="school/courses/add" element={<CourseForm />} />
            <Route path="school/courses/edit/:id" element={<CourseForm />} />
            <Route path="school/courses/:id" element={<CourseDetail />} />
            <Route
              path="school/educators"
              element={<Educators userType="school" />}
            />
            <Route
              path="school/notification"
              element={<Notification userType="school" />}
            />


            {/* Tutor routes */}
            <Route path="tutor" element={<TutorDashboard />} />
            <Route
              path="tutor/courses"
              element={<Courses userType="tutor" />}
            />
            <Route path="tutor/courses/add" element={<CourseForm />} />
            <Route path="tutor/courses/edit/:id" element={<CourseForm />} />
            <Route path="tutor/courses/:id" element={<CourseDetail />} />
            <Route
              path="tutor/notification"
              element={<Notification userType="tutor" />}
            />


            {/* Default redirect */}
            <Route path="" element={<Navigate to="/" replace />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SmoothScrollProvider>
  );
};

export default App;
