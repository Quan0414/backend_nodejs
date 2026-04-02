const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes example
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        success: true,
        data: {
            userId: req.user.id,
            message: 'You have accessed a protected route'
        }
    });
});

module.exports = router;
