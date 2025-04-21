import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { FaBars, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';

function TopBar({ toggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <div className="bg-white shadow-md z-10 sticky top-0">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        {/* Left side - Mobile menu toggle */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <div className="ml-4 md:hidden">
            <img className="h-8" src="/logo.svg" alt="IIM-LMS Logo" />
          </div>
        </div>

        {/* Right side - User profile, language selector, logout */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center text-gray-700 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-2">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block font-medium">{user?.name}</span>
              <svg
                className="ml-1 h-5 w-5 text-gray-400 hidden md:block"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 sm:hidden">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaCog className="mr-2" />
                  {t('common.settings')}
                </a>
                <div className="sm:hidden px-4 py-2">
                  <LanguageSelector />
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>

          {/* Logout Button (visible on larger screens) */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
