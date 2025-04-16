import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotAccountThunk, verifyOTPThunk, resetOTPState } from '../redux/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [showResendButton, setShowResendButton] = useState(false);
  const [timer, setTimer] = useState(30);
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

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      await dispatch(forgotAccountThunk(email));
    } catch (error) {
      console.error('Failed to send OTP:', error);
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

  const handleBackToRequest = () => {
    dispatch(resetOTPState());
    setOtpValues(['', '', '', '', '', '']);
    setVerificationError('');
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(forgotAccountThunk(email));
      setTimer(30);
      setShowResendButton(false);
      setVerificationError('');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center">
              <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
              <span className="ml-2 text-xl font-bold text-blue-800">IIM-LMS</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {otpRequested ? t('auth.verifyOTP') : t('auth.forgotAccount')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {otpRequested
              ? t('auth.otpVerificationMessage')
              : t('auth.forgotAccountMessage')}
          </p>
        </div>

        {!otpRequested ? (
          // Step 1: Request Recovery OTP Form
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div className="rounded-md -space-y-px">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.email')}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.enterEmail')}
                />
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
                  t('auth.sendOTP')
                )}
              </button>
            </div>
          </form>
        ) : (
          // Step 2: Verify Recovery OTP Form
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="text-center mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  {t('auth.otpSentMessage')}
                </p>
                <p className="text-sm font-medium text-blue-800 mt-1">
                  {email}
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
                onClick={handleBackToRequest}
                className="text-sm text-blue-600 hover:text-blue-500 block mx-auto mt-2"
              >
                {t('auth.backToRequest')}
              </button>
            </div>
          </form>
        )}

        {error && !verificationError && (
          <div className="mt-3 text-sm text-center text-red-600">
            {error}
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
            {t('common.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;