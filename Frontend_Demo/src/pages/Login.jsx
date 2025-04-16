import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestOTPThunk, verifyOTPThunk, resetOTPState } from '../redux/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [timer, setTimer] = useState(30);
  const [pageTitle, setPageTitle] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const otpInputsRef = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, error, otpRequested, userId, debugOtp } = useSelector((state) => state.auth);

  // Start timer for resend button
  useEffect(() => {
    let interval;
    if (otpRequested && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setShowResendButton(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [otpRequested, timer]);

  // Reset timer when OTP is requested
  useEffect(() => {
    if (otpRequested) {
      setTimer(30);
      setShowResendButton(false);
      setVerificationError('');
      // Clear OTP inputs when new OTP is requested
      setOtpValues(['', '', '', '', '', '']);
    }
  }, [otpRequested]);

  // Set the page title
  useEffect(() => {
    setPageTitle(otpRequested ? t('auth.verifyOTP') : t('auth.loginTitle'));
  }, [otpRequested, t]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      // Format phone number to ensure it has +91 prefix
      let formattedPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith('+91')) {
        formattedPhoneNumber = '+91' + phoneNumber.replace(/^0+/, '');
      }
      await dispatch(requestOTPThunk({ email, phoneNumber: formattedPhoneNumber }));
    } catch (error) {
      console.error('Failed to request OTP:', error);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    // Update the OTP value at this position
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input if current is filled
    if (value && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }

    // Clear error when user types
    if (verificationError) {
      setVerificationError('');
    }
  };

  const handleKeyDown = (index, e) => {
    // Navigate between inputs with arrow keys
    if (e.key === 'ArrowRight' && index < 5) {
      otpInputsRef.current[index + 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
    // Handle backspace to go to previous input and clear
    else if (e.key === 'Backspace' && index > 0 && otpValues[index] === '') {
      otpInputsRef.current[index - 1].focus();
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    // If pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpValues(digits);

      // Focus last input after paste
      otpInputsRef.current[5].focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    // Combine OTP values into a single string
    const otp = otpValues.join('');

    // Validate OTP
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setVerificationError(t('auth.invalidOTPFormat'));
      return;
    }

    try {
      const resultAction = await dispatch(verifyOTPThunk({ userId, otp }));
      if (!resultAction.error) {
        navigate('/dashboard');
      } else {
        // Handle verification error but stay on the same screen
        setVerificationError(resultAction.payload || t('auth.invalidOTP'));

        // Clear OTP inputs on error
        setOtpValues(['', '', '', '', '', '']);

        // Focus first input
        otpInputsRef.current[0].focus();
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setVerificationError(t('auth.verificationFailed'));

      // Clear OTP inputs on error
      setOtpValues(['', '', '', '', '', '']);

      // Focus first input
      otpInputsRef.current[0].focus();
    }
  };

  const handleBackToLogin = () => {
    dispatch(resetOTPState());
    setOtpValues(['', '', '', '', '', '']);
    setVerificationError('');
  };

  const handleResendOTP = async () => {
    try {
      // Format phone number to ensure it has +91 prefix
      let formattedPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith('+91')) {
        formattedPhoneNumber = '+91' + phoneNumber.replace(/^0+/, '');
      }
      await dispatch(requestOTPThunk({ email, phoneNumber: formattedPhoneNumber }));
      setTimer(30);
      setShowResendButton(false);
      setVerificationError('');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
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

          <h2 className="mt-8 text-3xl font-extrabold text-gray-900">{pageTitle}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {otpRequested ? t('auth.otpSubtitle') : t('auth.loginSubtitle')}
          </p>

          {!otpRequested ? (
            // Step 1: Request OTP Form
            <form onSubmit={handleRequestOTP} className="mt-8 space-y-6">
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
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">{t('common.phoneNumber')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => {
                        // Only allow numbers and remove any non-numeric characters
                        const value = e.target.value.replace(/\D/g, '');
                        setPhoneNumber(value);
                      }}
                      className="appearance-none relative block w-full pl-12 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={t('common.phoneNumber')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    {t('common.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    {t('common.forgotAccount')}?
                  </Link>
                </div>
              </div>

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
                      {t('common.sending')}...
                    </>
                  ) : (
                    t('auth.requestOTP')
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Step 2: Verify OTP Form
            <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
              <div className="text-center mb-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    {t('auth.otpSentMessage')}
                  </p>
                  <p className="text-sm font-medium text-blue-800 mt-1">
                    +91{phoneNumber} & {email}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="otp-input-0" className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  {t('auth.enterOTPDigits')}
                </label>

                <div className="flex justify-center items-center gap-2">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputsRef.current[index] = el}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-10 h-12 text-center font-semibold text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                    />
                  ))}
                </div>

                {verificationError && (
                  <p className="mt-2 text-sm text-center text-red-600">
                    {verificationError}
                  </p>
                )}

                {/* Show debug OTP info in development */}
                {process.env.NODE_ENV === 'development' && debugOtp && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <p className="text-xs text-yellow-700">Debug OTP (development only): <strong>{debugOtp}</strong></p>
                  </div>
                )}
              </div>

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
                      {t('common.verifying')}...
                    </>
                  ) : (
                    t('auth.verifyAndLogin')
                  )}
                </button>
              </div>

              {/* Resend OTP section */}
              <div className="text-center">
                {showResendButton ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {t('auth.resendOTP')}
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    {t('auth.resendCodeIn')} <span className="font-medium">{timer}s</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-blue-600 hover:text-blue-500 block mx-auto mt-2"
                >
                  {t('common.backToLogin')}
                </button>
              </div>
            </form>
          )}

          {error && !verificationError && (
            <div className="mt-3 text-sm text-center text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Right side - Demo Accounts */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-10 text-white">
          <h3 className="text-2xl font-bold mb-6">{t('auth.demoAccounts')}</h3>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold">{t('auth.systemAdmin')}</h4>
              <p className="text-sm opacity-90">{t('common.email')}: jaivik.patel@fabaf.in</p>
              <p className="text-sm opacity-90">{t('common.phoneNumber')}: +919664774890</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold">{t('auth.universityAdmin')}</h4>
              <p className="text-sm opacity-90">{t('common.email')}: zeel.fabaf@gmail.com</p>
              <p className="text-sm opacity-90">{t('common.phoneNumber')}: +919904424789</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold">{t('auth.educatorAccount')}</h4>
              <p className="text-sm opacity-90">{t('common.email')}: anandkumarbarot@gmail.com</p>
              <p className="text-sm opacity-90">{t('common.phoneNumber')}: +918140977185</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;