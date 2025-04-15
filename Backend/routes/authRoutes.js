const express = require('express');
const { login, forgotPassword, resetPassword, refreshToken, logout } = require('../controllers/authController');
const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Password management routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;