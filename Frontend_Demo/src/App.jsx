import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyLearning from './pages/MyLearning';
import ContentPage from './pages/ContentPage';
import MyContent from './pages/MyContent';
import Settings from './pages/Settings';
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';
import CourseQuiz from './pages/CourseQuiz';
import MyCertificates from './pages/MyCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import UniversityEducators from './pages/UniversityEducators';
import AdminDashboard from './pages/AdminDashboard';
import AdminUniversities from './pages/AdminUniversities';
import AdminContent from './pages/AdminContent';
import AdminCourses from './pages/AdminCourses';
import AdminCourseDetail from './pages/AdminCourseDetail';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminRoles from './pages/AdminRoles';
import CmsPages from './pages/CmsPages';
import CmsBuilder from './pages/CmsBuilder';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, role, permissions }) => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is logged in
  if (!user) return <Navigate to="/" />;

  // Check role if specified
  if (role && user.role !== role) {
    // Special case for educators with course management permissions
    if (role === 'admin' && user.role === 'educator' &&
        permissions && permissions.some(perm => user.permissions?.[perm])) {
      // Allow educators with specific permissions to access admin-like routes
      return children;
    }
    return <Navigate to="/dashboard" />;
  }

  // Check permissions if specified
  if (permissions && permissions.length > 0) {
    const hasPermission = permissions.some(permission => user.permissions?.[permission]);
    if (!hasPermission) return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer
          position="top-right"
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
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-learning" element={<ProtectedRoute role="educator"><MyLearning /></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute role="educator"><ContentPage /></ProtectedRoute>} />
        <Route path="/my-content" element={<ProtectedRoute role="educator"><MyContent /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/course/:id/learn" element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
        <Route path="/course/:id/quiz" element={<ProtectedRoute><CourseQuiz /></ProtectedRoute>} />
        <Route path="/my-certificates" element={<ProtectedRoute role="educator"><MyCertificates /></ProtectedRoute>} />
        <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />
        <Route path="/university/educators" element={<ProtectedRoute role="university"><UniversityEducators /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/universities" element={<ProtectedRoute role="admin"><AdminUniversities /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute role="admin"><AdminContent /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
        <Route path="/educator/courses" element={<ProtectedRoute role="educator" permissions={['COURSE_MANAGEMENT.CREATE_COURSE', 'COURSE_MANAGEMENT.EDIT_COURSE', 'COURSE_MANAGEMENT.DELETE_COURSE']}><AdminCourses /></ProtectedRoute>} />
        <Route path="/university/courses" element={<ProtectedRoute role="university" permissions={['COURSE_MANAGEMENT.CREATE_COURSE', 'COURSE_MANAGEMENT.EDIT_COURSE', 'COURSE_MANAGEMENT.DELETE_COURSE']}><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/course/:id" element={<ProtectedRoute role="admin"><AdminCourseDetail /></ProtectedRoute>} />
        <Route path="/educator/course/:id" element={<ProtectedRoute role="educator" permissions={['COURSE_MANAGEMENT.CREATE_COURSE', 'COURSE_MANAGEMENT.EDIT_COURSE', 'COURSE_MANAGEMENT.DELETE_COURSE']}><AdminCourseDetail /></ProtectedRoute>} />
        <Route path="/university/course/:id" element={<ProtectedRoute role="university" permissions={['COURSE_MANAGEMENT.CREATE_COURSE', 'COURSE_MANAGEMENT.EDIT_COURSE', 'COURSE_MANAGEMENT.DELETE_COURSE']}><AdminCourseDetail /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={<ProtectedRoute role="admin"><AdminQuizzes /></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute role="admin"><AdminRoles /></ProtectedRoute>} />
        <Route path="/admin/pages" element={<ProtectedRoute role="admin"><CmsPages /></ProtectedRoute>} />
        <Route path="/admin/cms/create" element={<ProtectedRoute role="admin"><CmsBuilder /></ProtectedRoute>} />
        <Route path="/admin/cms/edit/:id" element={<ProtectedRoute role="admin"><CmsBuilder /></ProtectedRoute>} />
        </Routes>
      </div>
    </Layout>
  );
}

export default App;