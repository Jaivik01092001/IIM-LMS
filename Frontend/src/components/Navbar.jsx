import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/auth/authSlice';
import { Link } from 'react-router-dom';

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => dispatch(logout());

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">EduPlatform</Link>
      <div className="space-x-4">
        {user?.role === 'educator' && (
          <>
            <Link to="/my-learning">My Learning</Link>
            <Link to="/content">Content</Link>
            <Link to="/my-content">My Content</Link>
          </>
        )}
        {user?.role === 'university' && <Link to="/university/educators">Educators</Link>}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/universities">Universities</Link>
            <Link to="/admin/content">Content</Link>
            <Link to="/admin/courses">Courses</Link>
          </>
        )}
        <Link to="/settings">Settings</Link>
        <button onClick={handleLogout} className="hover:underline">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;