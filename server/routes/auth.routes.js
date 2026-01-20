// File: server/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerification
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegistration, validateLogin } = require('../utils/validators');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.put('/update-password', protect, updatePassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
