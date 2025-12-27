const VerificationCode = require('../models/VerificationCode');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure Nodemailer (ensure process.env keys are set)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or configured service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        // Generate 6-char alphanumeric code (uppercase)
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Save to DB (upsert)
        await VerificationCode.findOneAndUpdate(
            { email },
            { email, code, expiresAt: Date.now() + 5 * 60 * 1000 }, // 5 mins
            { upsert: true, new: true }
        );

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`
        };

        // If in development or no creds, just log it (optional, but good for testing if env missing)
        if (!process.env.EMAIL_USER) {
            console.log(`[DEV] Verification Code for ${email}: ${code}`);
            return res.status(200).json({ message: 'Verification code sent (Dev Mode checked logs)' });
        }

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Verification code sent' });

    } catch (error) {
        console.error('Send Code Error:', error);
        res.status(500).json({ message: 'Failed to send verification code' });
    }
};

exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

        const record = await VerificationCode.findOne({ email });
        if (!record) return res.status(400).json({ message: 'Invalid or expired code' });

        if (record.code !== code.toUpperCase()) { // Ensure case insensitivity if needed, but strictly matching generated upper
            return res.status(400).json({ message: 'Invalid code' });
        }

        // Code matches
        // Do NOT delete here. The code must remain valid for the actual Registration step.
        // It will be deleted by authController.registerNewUser
        // await VerificationCode.deleteOne({ email });

        res.status(200).json({ message: 'Email verified successfully', verified: true });

    } catch (error) {
        console.error('Verify Code Error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
};
