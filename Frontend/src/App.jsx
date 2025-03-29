import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EducatorDashboard from './pages/EducatorDashboard';
import MyLearning from './pages/MyLearning';
import ContentPage from './pages/ContentPage';
import MyContent from './pages/MyContent';
import Settings from './pages/Settings';
import UniversityEducators from './pages/UniversityEducators';
import AdminUniversities from './pages/AdminUniversities';
import AdminContent from './pages/AdminContent';
import AdminCourses from './pages/AdminCourses';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute><EducatorDashboard /></ProtectedRoute>} />
        <Route path="/my-learning" element={<ProtectedRoute role="educator"><MyLearning /></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute role="educator"><ContentPage /></ProtectedRoute>} />
        <Route path="/my-content" element={<ProtectedRoute role="educator"><MyContent /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/university/educators" element={<ProtectedRoute role="university"><UniversityEducators /></ProtectedRoute>} />
        <Route path="/admin/universities" element={<ProtectedRoute role="admin"><AdminUniversities /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute role="admin"><AdminContent /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;