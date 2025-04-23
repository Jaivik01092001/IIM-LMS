import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { hasPermission } from './utils/permissions';
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
import AdminStaff from './pages/AdminStaff';
import CmsPages from './pages/CmsPages';
import CmsBuilder from './pages/CmsBuilder';
import Layout from './components/Layout';
import EducatorDashboard from './pages/EducatorDashboard';

const ProtectedRoute = ({ children, role, permissions }) => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is logged in
  if (!user) return <Navigate to="/" />;

  // Check role if specified
  if (role && user.role !== role) {
    // Special case for educators with course management permissions
    if (role === 'admin' && user.role === 'educator' && user.permissions !== null &&
      permissions && permissions.some(perm => hasPermission(user, perm))) {
      // Allow educators with specific permissions to access admin-like routes
      return children;
    }
    return <Navigate to="/dashboard" />;
  }

  // Check permissions if specified
  if (permissions && permissions.length > 0) {
    // If permissions is null, user has no permissions
    if (user.permissions === null) {
      return <Navigate to="/dashboard" />;
    }

    const permissionResults = permissions.map(permission => ({
      permission,
      hasPermission: hasPermission(user, permission)
    }));

    const userHasPermission = permissionResults.some(result => result.hasPermission);

    if (!userHasPermission) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

// Debug component to display user data
const UserDebug = () => {
  const { user } = useSelector((state) => state.auth);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0%',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '400px',
      fontSize: '12px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <h4>User Debug Info</h4>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

function App() {
  const { user } = useSelector((state) => state.auth);

  // Force refresh localStorage user data to ensure it's up to date
  useEffect(() => {
    if (user) {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || 'null');
      // Sync localStorage if needed
    }
  }, [user]);
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <UserDebug />
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
          <Route path="/dashboard" element={<ProtectedRoute><EducatorDashboard /></ProtectedRoute>} />
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
          <Route path="/educator/courses" element={<ProtectedRoute role="educator" permissions={['create_course', 'edit_course', 'delete_course']}><AdminCourses /></ProtectedRoute>} />
          <Route path="/university/courses" element={<ProtectedRoute role="university" permissions={['create_course', 'edit_course', 'delete_course']}><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/course/:id" element={<ProtectedRoute role="admin"><AdminCourseDetail /></ProtectedRoute>} />
          <Route path="/educator/course/:id" element={<ProtectedRoute role="educator" permissions={['create_course', 'edit_course', 'delete_course']}><AdminCourseDetail /></ProtectedRoute>} />
          <Route path="/university/course/:id" element={<ProtectedRoute role="university" permissions={['create_course', 'edit_course', 'delete_course']}><AdminCourseDetail /></ProtectedRoute>} />
          {/* Quiz Management Routes */}
          <Route path="/admin/quizzes" element={<ProtectedRoute role="admin"><AdminQuizzes /></ProtectedRoute>} />
          <Route path="/educator/quizzes" element={<ProtectedRoute role="educator" permissions={['view_quizzes', 'create_quiz', 'edit_quiz', 'delete_quiz']}><AdminQuizzes /></ProtectedRoute>} />
          <Route path="/university/quizzes" element={<ProtectedRoute role="university" permissions={['view_quizzes', 'create_quiz', 'edit_quiz', 'delete_quiz']}><AdminQuizzes /></ProtectedRoute>} />

          {/* User Management Routes */}
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminStaff /></ProtectedRoute>} />
          <Route path="/educator/users" element={<ProtectedRoute role="educator" permissions={['view_users', 'create_user', 'edit_user', 'delete_user']}><AdminStaff /></ProtectedRoute>} />
          <Route path="/university/users" element={<ProtectedRoute role="university" permissions={['view_users', 'create_user', 'edit_user', 'delete_user']}><AdminStaff /></ProtectedRoute>} />

          {/* Content Management Routes */}
          <Route path="/admin/content" element={<ProtectedRoute role="admin"><AdminContent /></ProtectedRoute>} />
          <Route path="/educator/content" element={<ProtectedRoute role="educator" permissions={['view_content', 'create_content', 'edit_content', 'delete_content']}><AdminContent /></ProtectedRoute>} />
          <Route path="/university/content" element={<ProtectedRoute role="university" permissions={['view_content', 'create_content', 'edit_content', 'delete_content']}><AdminContent /></ProtectedRoute>} />

          {/* Admin-only Routes */}
          <Route path="/admin/roles" element={<ProtectedRoute role="admin"><AdminRoles /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute role="admin"><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/pages" element={<ProtectedRoute role="admin"><CmsPages /></ProtectedRoute>} />
          <Route path="/admin/cms/create" element={<ProtectedRoute role="admin"><CmsBuilder /></ProtectedRoute>} />
          <Route path="/admin/cms/edit/:id" element={<ProtectedRoute role="admin"><CmsBuilder /></ProtectedRoute>} />
        </Routes>
      </div>
    </Layout>
  );
}

export default App;