import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

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

export default router;
