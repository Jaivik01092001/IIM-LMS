const crypto = require('crypto');
const twilio = require('twilio');
const sendEmail = require('./email');
const User = require('../models/User');

// Twilio client setup
const twilioClient = process.env.DISABLE_SMS_DELIVERY === 'true'
    ? null
    : twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio SMS
const sendSMS = async (phoneNumber, message) => {
    // Skip actual SMS delivery in development when disabled
    if (process.env.DISABLE_SMS_DELIVERY === 'true') {
        console.log('SMS delivery disabled. Would have sent:');
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        return { success: true, simulated: true };
    }

    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        return { success: true };
    } catch (error) {
        console.error('Twilio SMS Error:', error);
        // Check if the error is due to rate limiting
        const isRateLimited = error.code === 63038 || error.status === 429;
        return {
            success: false,
            isRateLimited,
            error: error.message
        };
    }
};

// Generate and save OTP for a user
const generateAndSaveOTP = async (user) => {
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Save OTP to user document
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    return otp;
};

// Send OTP to user via SMS and Email
const sendOTP = async (user) => {
    try {
        const otp = await generateAndSaveOTP(user);

        // Send via SMS - capture delivery issues
        const smsResult = await sendSMS(
            user.phoneNumber,
            `Your OTP for IIM-LMS login is: ${otp}. Valid for 10 minutes.`
        );

        // Try to send via email as backup - don't fail if email fails
        let emailSuccess = true;
        try {
            await sendEmail(
                user.email,
                'Your Login OTP',
                `Your OTP for IIM-LMS login is: ${otp}. Valid for 10 minutes.`
            );
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            emailSuccess = false;
        }

        // Return success if either SMS or email was delivered
        const success = smsResult.success || emailSuccess;

        return {
            success,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only in development
            smsDelivered: smsResult.success,
            emailDelivered: emailSuccess,
            smsRateLimited: smsResult.isRateLimited || false,
            simulated: smsResult.simulated || false
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, error: error.message };
    }
};

// Verify OTP provided by user
const verifyOTP = async (userId, providedOTP) => {
    const user = await User.findById(userId);

    if (!user || !user.otp || !user.otpExpires) {
        return { valid: false, message: 'No OTP found for this user' };
    }

    if (user.otpExpires < Date.now()) {
        return { valid: false, message: 'OTP has expired' };
    }

    if (user.otp !== providedOTP) {
        return { valid: false, message: 'Invalid OTP' };
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return { valid: true, user };
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP
};