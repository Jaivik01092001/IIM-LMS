import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EducatorDashboard from './pages/EducatorDashboard';
import MyLearning from './pages/MyLearning';
import ContentPage from './pages/ContentPage';
import MyContent from './pages/MyContent';
import Settings from './pages/Settings';
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';
import CourseQuiz from './pages/CourseQuiz';
import UniversityEducators from './pages/UniversityEducators';
import AdminUniversities from './pages/AdminUniversities';
import AdminContent from './pages/AdminContent';
import AdminCourses from './pages/AdminCourses';
import AdminCourseDetail from './pages/AdminCourseDetail';
import AdminQuizzes from './pages/AdminQuizzes';
import CmsPages from './pages/CmsPages';
import CmsBuilder from './pages/CmsBuilder';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
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
      {user && <Navbar />}
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
        <Route path="/university/educators" element={<ProtectedRoute role="university"><UniversityEducators /></ProtectedRoute>} />
        <Route path="/admin/universities" element={<ProtectedRoute role="admin"><AdminUniversities /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute role="admin"><AdminContent /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/course/:id" element={<ProtectedRoute role="admin"><AdminCourseDetail /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={<ProtectedRoute role="admin"><AdminQuizzes /></ProtectedRoute>} />
        <Route path="/admin/pages" element={<ProtectedRoute role="admin"><CmsPages /></ProtectedRoute>} />
        <Route path="/admin/cms/create" element={<ProtectedRoute role="admin"><CmsBuilder /></ProtectedRoute>} />
        <Route path="/admin/cms/edit/:id" element={<ProtectedRoute role="admin"><CmsBuilder /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;