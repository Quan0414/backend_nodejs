const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: parseInt(process.env.OTP_EXPIRES_MINUTES || 5) * 60 // OTP hết hạn sau số phút xác định
    }
});

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
