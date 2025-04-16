import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Redirect to forgot password page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/forgot-password');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
              <span className="ml-2 text-2xl font-bold text-blue-800">IIM-LMS</span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.authenticationUpdated')}</h2>
        </div>

        <div className="p-8">
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center justify-center py-4">
              <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t('auth.otpAuthentication')}</h3>
              <p className="text-gray-600 mb-4">
                {t('auth.otpAuthenticationMessage')}
              </p>
              <p className="text-gray-600 mb-2">
                {t('auth.redirectingToRecovery')}
              </p>
            </div>

            <div className="text-center pt-4">
              <Link
                to="/forgot-password"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('common.goToRecovery')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;