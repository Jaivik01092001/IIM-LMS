import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginThunk } from '../redux/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password })).then(() => navigate('/dashboard'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left side - Login Form */}
        <div className="md:w-1/2 p-8 md:p-10">
          <div className="flex justify-center md:justify-start">
            <div className="flex items-center">
              <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
              <span className="ml-2 text-2xl font-bold text-blue-800">IIM-LMS</span>
            </div>
          </div>

          <h2 className="mt-8 text-3xl font-extrabold text-gray-900">{t('auth.loginTitle')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.loginSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md -space-y-px">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('common.email')}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('common.password')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('common.password')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t('common.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('common.forgotPassword')}?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg"
              >
                {t('common.login')}
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Demo Accounts */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-10 text-white">
          <h3 className="text-2xl font-bold mb-6">{t('auth.demoAccounts')}</h3>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold">{t('auth.educatorAccount')}</h4>
              <p className="text-sm opacity-90">{t('common.email')}: school@example.com</p>
              <p className="text-sm opacity-90">{t('common.password')}: password</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold">{t('auth.universityAdmin')}</h4>
              <p className="text-sm opacity-90">{t('common.email')}: admin@example.com</p>
              <p className="text-sm opacity-90">{t('common.password')}: password</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold">{t('auth.systemAdmin')}</h4>
              <p className="text-sm opacity-90">{t('common.email')}: educator@example.com</p>
              <p className="text-sm opacity-90">{t('common.password')}: password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;