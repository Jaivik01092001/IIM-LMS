import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordThunk } from '../redux/auth/authSlice';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { loading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      setPasswordError(t('auth.passwordTooShort'));
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.passwordsDoNotMatch'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    const resultAction = await dispatch(resetPasswordThunk({ token, newPassword }));
    if (!resultAction.error) {
      setSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.resetPassword')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.createNewPassword')}
          </p>
        </div>

        <div className="p-8">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('auth.passwordResetSuccess')}</h3>
                <p className="text-gray-600 mb-4">{t('auth.redirectingToLogin')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.newPassword')}</label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.enterNewPassword')}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.confirmNewPassword')}
                  disabled={loading}
                />
              </div>

              {passwordError && (
                <div className="text-sm text-center text-red-600">
                  {passwordError}
                </div>
              )}

              {error && (
                <div className="text-sm text-center text-red-600">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('auth.resetting')}...
                    </>
                  ) : (
                    t('auth.resetPassword')
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                  {t('common.backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;