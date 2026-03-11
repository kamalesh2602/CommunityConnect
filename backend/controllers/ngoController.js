const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');

// Register NGO
const registerNGO = async (req, res) => {
    try {
        const { ngoName, email, password, phone, registrationNumber, panNumber, address } = req.body;

        const ngoExists = await NGO.findOne({ email });
        if (ngoExists) {
            return res.status(400).json({ message: 'NGO already exists' });
        }

        const ngo = await NGO.create({
            ngoName, email, password, phone, registrationNumber, panNumber, address
        });

        if (ngo) {
            res.status(201).json({
                _id: ngo._id,
                ngoName: ngo.ngoName,
                email: ngo.email,
                verified: ngo.verified,
                role: 'ngo',
                token: generateToken(ngo._id, 'ngo')
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login NGO
const loginNGO = async (req, res) => {
    try {
        const { email, password } = req.body;

        const ngo = await NGO.findOne({ email });

        if (ngo && (await ngo.matchPassword(password))) {
            res.json({
                _id: ngo._id,
                ngoName: ngo.ngoName,
                email: ngo.email,
                verified: ngo.verified,
                role: 'ngo',
                token: generateToken(ngo._id, 'ngo')
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get NGO Followers
const getNGOFollowers = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.user._id).populate('followers', '-password');
        res.json(ngo.followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot Password
const forgotPasswordNGO = async (req, res) => {
    try {
        const { email } = req.body;
        const ngo = await NGO.findOne({ email });

        if (!ngo) {
            return res.status(404).json({ message: 'NGO not found with this email' });
        }

        const resetToken = ngo.getResetPasswordToken();
        await ngo.save({ validateBeforeSave: false });

        // In a real app, send email here. For now, return token (simulated)
        console.log(`Reset Token for ${email}: ${resetToken}`);

        res.json({
            message: 'Email sent (simulated)',
            resetToken // Only for development/testing convenience
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset Password
const resetPasswordNGO = async (req, res) => {
    try {
        const crypto = require('crypto');
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const ngo = await NGO.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!ngo) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        ngo.password = req.body.password;
        ngo.resetPasswordToken = undefined;
        ngo.resetPasswordExpire = undefined;

        await ngo.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerNGO,
    loginNGO,
    getNGOFollowers,
    forgotPasswordNGO,
    resetPasswordNGO
};
