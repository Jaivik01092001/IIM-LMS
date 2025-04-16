import React, { useState } from "react";
import "../assets/styles/login.css";
import logo from "../assets/images/login_page/logo.svg";
import login_background from "../assets/images/login_page/login_background.svg";
import campus_img from "../assets/images/login_page/campus_img.svg";
import { IoPhonePortraitOutline } from "react-icons/io5";

const Login = () => {
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    let message = "";

    if (!/^[0-9]{10}$/.test(phone)) {
      message = "Phone number must be exactly 10 digits.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message = "Please enter a valid email address.";
    }

    if (message) {
      setError(message);
      return;
    }

    setError("");
    setIsOtpScreen(true); // move to OTP screen
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left side remains same */}
        <div className="login-left">
          <img
            src={login_background}
            alt="IIM Ahmedabad"
            className="bg-image"
          />
          <img src={campus_img} alt="campus_img" className="campusimage" />
          <div className="logo-container">
            <img src={logo} alt="IIMA Logo" className="logo" />
            <h1>IIM AHMEDABAD</h1>
          </div>
        </div>

        {/* Right side toggles content */}
        <div className="login-right">
          <div className="login-right-mainheading">
            <h2>IIM AHMEDABAD</h2>
          </div>
          <div className="right-Second_part">
            {!isOtpScreen ? (
              <>
                <div>
                  <h3>Login in to your account</h3>
                </div>
                <div>
                  <div className="form-group">
                    <label>Phone</label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">
                        <IoPhonePortraitOutline className="phoneIcon" /> +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="00000 00000"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={error.includes("Phone") ? "input-error" : ""}
                      />
                    </div>
                    {error.includes("Phone") && (
                      <p className="form-error">{error}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={error.includes("email") ? "input-error" : ""}
                    />
                    {error.includes("email") && (
                      <p className="form-error">{error}</p>
                    )}
                  </div>

                  <a className="login-btn" onClick={handleLogin}>
                    Login Now
                  </a>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3>OTP Verification</h3>
                  <p>Enter The OTP sent to +91 {phone}</p>
                </div>
                <div className="Otp-form-group">
                  <input type="tel" maxLength="1" />
                  <input type="tel" maxLength="1" />
                  <input type="tel" maxLength="1" />
                  <input type="tel" maxLength="1" />
                  <input type="tel" maxLength="1" />
                  <input type="tel" maxLength="1" />
                </div>
                <p className="resend">
                  Didn't receive OTP? <a href="#">Resend</a>
                </p>
                <a className="login-btn">Verify</a>
                <p className="back-login" onClick={() => setIsOtpScreen(false)}>
                  ← Back To Login
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
