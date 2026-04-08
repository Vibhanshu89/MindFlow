const express = require('express');
const passport = require('passport');
const { register, login, getMe, updateProfile, googleCallback, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin', 'manager'), getAllUsers);

module.exports = router;
