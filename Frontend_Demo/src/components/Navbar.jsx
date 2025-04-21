import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../redux/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-8" src="/logo.svg" alt="IIM-LMS Logo" />
              <span className="ml-2 text-xl font-bold text-white">IIM-LMS</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'educator' && (
              <>
                <Link to="/my-learning" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('educator.myLearning')}
                </Link>
                <Link to="/content" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('educator.content')}
                </Link>
                <Link to="/my-content" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('educator.myContent')}
                </Link>
                <Link to="/my-certificates" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('educator.myCertificates') || 'My Certificates'}
                </Link>
              </>
            )}
            {user?.role === 'university' && (
              <Link to="/university/educators" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('university.educators')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('common.dashboard')}
                </Link>
                <Link to="/admin/universities" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('admin.universities')}
                </Link>
                <Link to="/admin/content" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('educator.content')}
                </Link>
                <Link to="/admin/quizzes" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('educator.quiz')}
                </Link>
                <Link to="/admin/courses" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('admin.courseManagement')}
                </Link>
                <Link to="/admin/roles" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('admin.roleManagement') || 'Roles & Permissions'}
                </Link>
                <Link to="/admin/pages" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('admin.cmsBuilder')}
                </Link>
              </>
            )}
            <Link to="/settings" className="text-white hover:bg-blue-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('common.settings')}
            </Link>
            <div className="ml-2">
              <LanguageSelector />
            </div>
            <button
              onClick={handleLogout}
              className="text-white bg-red-500 hover:bg-red-600 ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('common.logout')}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 hover:bg-opacity-25 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-blue-700`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user?.role === 'educator' && (
            <>
              <Link to="/my-learning" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('educator.myLearning')}
              </Link>
              <Link to="/content" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('educator.content')}
              </Link>
              <Link to="/my-content" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('educator.myContent')}
              </Link>
              <Link to="/my-certificates" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('educator.myCertificates') || 'My Certificates'}
              </Link>
            </>
          )}
          {user?.role === 'university' && (
            <Link to="/university/educators" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
              {t('university.educators')}
            </Link>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('common.dashboard')}
              </Link>
              <Link to="/admin/universities" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('admin.universities')}
              </Link>
              <Link to="/admin/content" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('educator.content')}
              </Link>
              <Link to="/admin/courses" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('admin.courseManagement')}
              </Link>
              <Link to="/admin/roles" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('admin.roleManagement') || 'Roles & Permissions'}
              </Link>
              <Link to="/admin/pages" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
                {t('admin.cmsBuilder')}
              </Link>
            </>
          )}
          <Link to="/settings" className="text-white hover:bg-blue-500 hover:bg-opacity-25 block px-3 py-2 rounded-md text-base font-medium">
            {t('common.settings')}
          </Link>
          <div className="px-3 py-2">
            <LanguageSelector />
          </div>
          <button
            onClick={handleLogout}
            className="text-white bg-red-500 hover:bg-red-600 w-full text-left px-3 py-2 rounded-md text-base font-medium mt-2"
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;