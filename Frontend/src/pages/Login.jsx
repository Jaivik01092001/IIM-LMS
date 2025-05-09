import { useState, useEffect, useRef } from "react";
import "../assets/styles/login.css";
import logo from "../assets/images/login_page/logo.svg";
import login_background from "../assets/images/login_page/login_background.svg";
import campus_img from "../assets/images/login_page/campus_img.svg";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { CiMail } from "react-icons/ci";
import {
  requestOTPThunk,
  verifyOTPThunk,
  resetOTPState,
} from "../redux/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showSuccessToast, showErrorToast } from "../utils/toast";

// Test credentials data
const TEST_CREDENTIALS = [
  {
    role: "Admin",
    email: "jaivik.patel@fabaf.in",
    phone: "+919664774890",
  },
  {
    role: "Admin",
    email: "nishant@fabaf.in",
    phone: "+918980905254",
  },
  {
    role: "Staff",
    email: "fabaf2021@gmail.com",
    phone: "+919924294542",
  },
  {
    role: "University",
    email: "zeel.fabaf@gmail.com",
    phone: "+919904424789",
  },
  {
    role: "Educator",
    email: "anandkumarbarot@gmail.com",
    phone: "+918140977185",
  },
];

/**
 * Modal component for displaying test credentials
 */
const CredentialsModal = ({ isOpen, onClose, onUseCredential }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t("auth.testCredentials")}</h3>
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <div className="credentials-grid">
          {TEST_CREDENTIALS.map((cred, index) => (
            <div key={index} className="credential-card">
              <h4>{cred.role}</h4>
              <p>
                {t("common.email")}: {cred.email}
              </p>
              <p>
                {t("common.phone")}: {cred.phone}
              </p>
              <button
                className="w-full bg-blue-600 text-white font-medium p-4 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-200"
                onClick={() => onUseCredential(cred)}
              >
                {t("auth.useCredential")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Main Login component
 */
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, otpRequested, userId, debugOtp } = useSelector(
    (state) => state.auth
  );

  // Form state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

  // OTP timer state
  const [timer, setTimer] = useState(30);
  const [showResendButton, setShowResendButton] = useState(false);

  // Modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const otpRefs = useRef([]);
  const otpContainerRef = useRef(null);

  // Check if user is already logged in and redirect
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.role) {
          // Redirect user based on role
          if (userData.role === "admin" || userData.role === "staff") {
            navigate("/dashboard/admin");
          } else if (userData.role === "university") {
            navigate("/dashboard/school");
          } else if (userData.role === "educator") {
            navigate("/dashboard/tutor");
          } else {
            navigate("/dashboard/tutor"); // Default fallback
          }
        }
      } catch {
        // Invalid user data in localStorage, clear it
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  // Effect to handle OTP request and reset form
  useEffect(() => {
    if (otpRequested) {
      setTimer(30);
      setShowResendButton(false);
      setOtpValues(["", "", "", "", "", ""]);
    }
  }, [otpRequested]);

  // Effect to handle OTP timer
  useEffect(() => {
    let interval;
    if (otpRequested && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setShowResendButton(true);
    }
    return () => clearInterval(interval);
  }, [otpRequested, timer]);

  /**
   * Verifies OTP and navigates to appropriate dashboard
   */
  const handleVerifyOTP = async () => {
    const otp = otpValues.join("");

    // Validate OTP
    if (otp.length !== 6) {
      showErrorToast(t("auth.enterValidOTP"));
      return;
    }

    // Prevent multiple verification attempts while loading
    if (loading) return;

    const result = await dispatch(verifyOTPThunk({ userId, otp }));

    if (!result.error) {
      const user = JSON.parse(localStorage.getItem("user"));

      // Navigate based on user role
      if (user.role === "admin" || user.role === "staff") {
        navigate("/dashboard/admin");
      } else if (user.role === "university") {
        navigate("/dashboard/school");
      } else if (user.role === "educator") {
        navigate("/dashboard/tutor");
      } else {
        navigate("/dashboard/tutor"); // Default fallback
      }

      if (result.payload && result.payload.message) {
        showSuccessToast(result.payload.message);
      }
    } else {
      if (result.payload && result.payload.message) {
        showErrorToast(result.payload.message);
      } else {
        showErrorToast(t("auth.invalidOTP"));
      }
      setOtpValues(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  // Effect to check if all OTP values are entered to auto-verify
  useEffect(() => {
    const allDigitsEntered = otpValues.every((val) => val !== "");
    if (allDigitsEntered && otpValues.length === 6) {
      handleVerifyOTP();
    }
  }, [otpValues]);

  /**
   * Handles using a test credential
   */
  const handleUseCredential = (credential) => {
    // Extract phone number without +91 prefix
    const phoneNumber = credential.phone.replace("+91", "");
    setPhone(phoneNumber);
    setEmail(credential.email);
    setShowCredentialsModal(false);
  };

  /**
   * Validates form and requests OTP
   */
  const handleLogin = async () => {
    if (!/^[0-9]{10}$/.test(phone)) {
      showErrorToast(t("auth.enterValidPhone"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErrorToast(t("auth.enterValidEmail"));
      return;
    }

    const formattedPhone = phone.startsWith("+91")
      ? phone
      : "+91" + phone.replace(/^0+/, "");

    // Instantly flip to OTP screen
    dispatch({ type: "auth/otpRequestedManually" });

    // Dispatch OTP request
    dispatch(requestOTPThunk({ phoneNumber: formattedPhone, email }));
  };

  /**
   * Handles OTP input changes
   */
  const handleOtpChange = (index, value) => {
    // Allow only digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input field
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  /**
   * Handles pasting OTP
   */
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain").trim();

    // Check if pasted text is 6 digit number
    if (/^\d{6}$/.test(pastedText)) {
      const digits = pastedText.split("");
      setOtpValues(digits);

      // Focus the last input after paste
      if (otpRefs.current[5]) {
        otpRefs.current[5].focus();
      }
    }
  };

  /**
   * Resends OTP
   */
  const handleResendOTP = async () => {
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : "+91" + phone.replace(/^0+/, "");
    const result = await dispatch(
      requestOTPThunk({ phoneNumber: formattedPhone, email })
    );
    if (result.payload && result.payload.message) {
      showSuccessToast(result.payload.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left side with logo and background */}
        <div className="login-left">
          <img src={login_background} alt="bg" className="bg-image" />
          <img src={campus_img} alt="campus" className="campusimage" />
          <div className="logo-container">
            <img src={logo} alt="logo" className="logo" />
            <h1>IIM AHMEDABAD</h1>
          </div>
        </div>

        {/* Right side with login form */}
        <div className="login-right">
          {/* <div className="login-right-mainheading">
            <div className="mainlogoimg">
              <img src={bluelogo} alt="" />
            </div>
          </div> */}
          <div className="right-Second_part">
            {!otpRequested ? (
              /* Login form */
              <>
                <h3>{t("auth.loginToAccount")}</h3>

                {/* Phone input */}
                <div className="form-group">
                  <label>{t("common.phone")}</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">
                      <IoPhonePortraitOutline className="phoneIcon" /> +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        /^[0-9]{0,10}$/.test(e.target.value) &&
                        setPhone(e.target.value)
                      }
                      placeholder="9915678456"
                    />
                  </div>
                </div>

                {/* Email input */}
                <div className="form-group">
                  <label>{t("common.email")}</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">
                      <CiMail className="phoneIcon" />
                    </span>
                    <input
                      type="email"
                      placeholder="abc@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Login button */}
                <button
                  className="login-btn"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? t("auth.requestingOTP") : t("auth.loginNow")}
                </button>

                {/* Test credentials button */}
                <button
                  className="test-credentials-btn"
                  onClick={() => setShowCredentialsModal(true)}
                >
                  <FaInfoCircle /> {t("auth.showTestCredentials")}
                </button>
              </>
            ) : (
              /* OTP verification form */
              <>
                <h3>{t("auth.otpVerification")}</h3>
                <p>
                  {t("auth.enterOTPSentTo")} +91 {phone}
                </p>

                {/* OTP input fields with paste functionality */}
                <div
                  className="Otp-form-group"
                  ref={otpContainerRef}
                  onPaste={handleOtpPaste}
                >
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      type="tel"
                      maxLength="1"
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !val && idx > 0) {
                          otpRefs.current[idx - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <p className="otp-note">{t("auth.otpNote")}</p>

                {/* Show debug OTP in development mode */}
                {debugOtp && (
                  <div
                    className="debug-otp-container"
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      backgroundColor: "#fff3cd",
                      borderRadius: "4px",
                      border: "1px solid #ffeeba",
                    }}
                  >
                    <p
                      className="debug-otp-text"
                      style={{
                        color: "#856404",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      {t("auth.developmentOTP")}: <strong>{debugOtp}</strong>
                    </p>
                  </div>
                )}

                {/* Resend OTP timer/button */}
                <p className="resend">
                  {showResendButton ? (
                    <a onClick={handleResendOTP}>{t("auth.resendOTP")}</a>
                  ) : (
                    `${t("auth.resendIn")} ${timer}s`
                  )}
                </p>

                {/* Back to login link */}
                <p
                  className="back-login"
                  onClick={() => dispatch(resetOTPState())}
                >
                  {t("auth.backToLogin")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Test credentials modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onUseCredential={handleUseCredential}
      />
    </div>
  );
};

export default Login;
