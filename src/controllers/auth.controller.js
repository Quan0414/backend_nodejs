const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// Generate 4-digit OTP
const generateOTPCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const authController = {
    // 1. Sign Up
    signup: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email is already registered' });
            }

            // Create new user
            const user = await User.create({ username, email, password });
            
            // Generate token
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: { id: user._id, username: user.username, email: user.email },
                    token
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Generate token
            const token = generateToken(user._id);

            res.status(200).json({
                success: true,
                message: 'Logged in successfully',
                data: {
                    user: { id: user._id, username: user.username, email: user.email },
                    token
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Forgot Password - Generate & Send OTP
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found with this email' });
            }

            // Generate 4-digit OTP
            const otpCode = generateOTPCode();

            // Delete old OTPs for this email if any exist
            await OTP.deleteMany({ email });

            // Save new OTP to database (will expire based on schema setting)
            await OTP.create({
                email,
                otp: otpCode
            });

            // Send Email
            const emailSent = await emailService.sendOTP(email, otpCode);
            
            if (!emailSent) {
                return res.status(500).json({ success: false, message: 'Error sending email. Please try again' });
            }

            res.status(200).json({
                success: true,
                message: 'OTP has been sent to your email'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Verify OTP
    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;

            const otpRecord = await OTP.findOne({ email, otp });
            
            if (!otpRecord) {
                return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            }

            // OTP is valid. In a real flow, you might return a temporary token here to be used for the reset step.
            // For simplicity, we just confirm it's valid. The client should proceed to the next screen.
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully. You can now reset your password.'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 5. Reset Password
    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;

            // Verify OTP again just to be safe
            const otpRecord = await OTP.findOne({ email, otp });
            if (!otpRecord) {
                return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            }

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update password (will be hashed by pre-save hook)
            user.password = newPassword;
            await user.save();

            // Delete used OTP
            await OTP.deleteOne({ _id: otpRecord._id });

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = authController;
