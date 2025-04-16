import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/login.css";
import logo from "../assets/images/login_page/logo.svg";
import login_background from "../assets/images/login_page/login_background.svg";
import campus_img from "../assets/images/login_page/campus_img.svg";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  requestOTPThunk,
  verifyOTPThunk,
  resetOTPState,
} from "../redux/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from '../utils/toast'; // Importing from utils

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpRequested, userId } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [timer, setTimer] = useState(30);
  const [showResendButton, setShowResendButton] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (otpRequested) {
      setTimer(30);
      setShowResendButton(false);
      setOtpValues(["", "", "", "", "", ""]);
    }
  }, [otpRequested]);

  useEffect(() => {
    let interval;
    if (otpRequested && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setShowResendButton(true);
    }
    return () => clearInterval(interval);
  }, [otpRequested, timer]);

  const handleLogin = async () => {
    let message = "";

    if (!/^[0-9]{10}$/.test(phone)) {
      message = "Phone number must be exactly 10 digits.";
      showErrorToast(message); // Show toast for error
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message = "Please enter a valid email address.";
      showErrorToast(message); // Show toast for error
    }

    if (message) {
      setErrorMessage(message);
      return;
    }

    const formattedPhone = phone.startsWith("+91") ? phone : "+91" + phone.replace(/^0+/, "");

    await dispatch(requestOTPThunk({ phoneNumber: formattedPhone, email }));
    showSuccessToast("OTP requested successfully!"); // Show toast for success
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setVerificationError("Enter a valid 6-digit OTP.");
      showErrorToast("Enter a valid 6-digit OTP."); // Show toast for error
      return;
    }

    const result = await dispatch(verifyOTPThunk({ userId, otp }));
    if (!result.error) {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log("user....", user);
      if (user.role == "admin") {
        console.log("user....", user.role);
        navigate("/dashboard/admin");
      } else if (user.role == "educator") {
        console.log("user....", user.role);
        navigate("/dashboard/school");
      } else {
        console.log("user....", user.role);
        navigate("/dashboard/tutor");
      }
      showSuccessToast("Login successful!"); // Show toast for success
    } else {
      setVerificationError("Invalid OTP. Try again.");
      showErrorToast("Invalid OTP. Try again."); // Show toast for error
      setOtpValues(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    const formattedPhone = phone.startsWith("+91") ? phone : "+91" + phone.replace(/^0+/, "");
    await dispatch(requestOTPThunk({ phoneNumber: formattedPhone, email }));
    showSuccessToast("OTP resent successfully!"); // Show toast for success
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left">
          <img src={login_background} alt="bg" className="bg-image" />
          <img src={campus_img} alt="campus" className="campusimage" />
          <div className="logo-container">
            <img src={logo} alt="logo" className="logo" />
            <h1>IIM AHMEDABAD</h1>
          </div>
        </div>

        <div className="login-right">
          <div className="login-right-mainheading">
            <h2>IIM AHMEDABAD</h2>
          </div>
          <div className="right-Second_part">
            {!otpRequested ? (
              <>
                <h3>Login in to your account</h3>
                <div className="form-group">
                  <label>Phone</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">
                      <IoPhonePortraitOutline className="phoneIcon" /> +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => /^[0-9]{0,10}$/.test(e.target.value) && setPhone(e.target.value)}
                      className={errorMessage.includes("Phone") ? "input-error" : ""}
                    />
                  </div>
                  {errorMessage.includes("Phone") && <p className="form-error">{errorMessage}</p>}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errorMessage.includes("email") ? "input-error" : ""}
                  />
                  {errorMessage.includes("email") && <p className="form-error">{errorMessage}</p>}
                </div>

                <a className="login-btn" onClick={handleLogin}>
                  {loading ? "Requesting OTP..." : "Login Now"}
                </a>
              </>
            ) : (
              <>
                <h3>OTP Verification</h3>
                <p>Enter the OTP sent to +91 {phone}</p>
                <div className="Otp-form-group">
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
                {verificationError && <p className="form-error">{verificationError}</p>}

                <p className="resend">
                  {showResendButton ? (
                    <a onClick={handleResendOTP}>Resend OTP</a>
                  ) : (
                    `Resend in ${timer}s`
                  )}
                </p>

                <a className="login-btn" onClick={handleVerifyOTP}>
                  {loading ? "Verifying..." : "Verify"}
                </a>

                <p className="back-login" onClick={() => dispatch(resetOTPState())}>
                  ← Back To Login
                </p>
              </>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white shadow-md p-4 rounded-lg mb-4">
              <h4 className="font-bold">Super Admin</h4>
              <p>Email: jaivik.patel@fabaf.in</p>
              <p>Phone Number: +919664774890</p>
            </div>
            <div className="bg-white shadow-md p-4 rounded-lg mb-4">
              <h4 className="font-bold">Super Admin</h4>
              <p>Email: fabaf2021@gmail.com</p>
              <p>Phone Number: +919924294542</p>
            </div>
            <div className="bg-white shadow-md p-4 rounded-lg mb-4">
              <h4 className="font-bold">Super Admin</h4>
              <p>Email: nishant@fabaf.in</p>
              <p>Phone Number: +918980905254</p>
            </div>
            <div className="bg-white shadow-md p-4 rounded-lg mb-4">
              <h4 className="font-bold">University Admin</h4>
              <p>Email: zeel.fabaf@gmail.com</p>
              <p>Phone Number: +919904424789</p>
            </div>
            <div className="bg-white shadow-md p-4 rounded-lg mb-4">
              <h4 className="font-bold">Educator Account</h4>
              <p>Email: anandkumarbarot@gmail.com</p>
              <p>Phone Number: +918140977185</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
