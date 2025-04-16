const express = require('express');
const { requestOTP, verifyOTP, forgotPassword, refreshToken, logout } = require('../controllers/authController');
const router = express.Router();

// OTP-based authentication routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Account recovery routes
router.post('/forgot-account', forgotPassword);

module.exports = router;