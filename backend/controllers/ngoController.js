const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendemails');
const crypto = require('crypto');

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

        // reset link
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}?role=ngo`;

        const message = `
You requested a password reset.

Click the link below to reset your password:

${resetUrl}

If you did not request this, please ignore this email.
`;

        // send email
        await sendEmail(
            ngo.email,
            "NGO Password Reset",
            message
        );

        res.json({
            message: "Password reset link sent to your email"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending email" });
    }
};

// Reset Password
const resetPasswordNGO = async (req, res) => {
    try {
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

// Get NGO Profile
const getNGOProfile = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.user._id).select('-password');
        if (ngo) {
            res.json(ngo);
        } else {
            res.status(404).json({ message: 'NGO not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Update NGO Profile
const updateNGOProfile = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.user._id);

        if (ngo) {
            ngo.ngoName = req.body.ngoName || ngo.ngoName;
            ngo.email = req.body.email || ngo.email;
            ngo.phone = req.body.phone || ngo.phone;
            ngo.registrationNumber = req.body.registrationNumber || ngo.registrationNumber;
            ngo.panNumber = req.body.panNumber || ngo.panNumber;
            ngo.address = req.body.address || ngo.address;

            if (req.body.password) {
                ngo.password = req.body.password;
            }

            const updatedNGO = await ngo.save();

            res.json({
                _id: updatedNGO._id,
                ngoName: updatedNGO.ngoName,
                email: updatedNGO.email,
                role: 'ngo',
                verified: updatedNGO.verified,
                token: generateToken(updatedNGO._id, 'ngo')
            });
        } else {
            res.status(404).json({ message: 'NGO not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
    registerNGO,
    loginNGO,
    getNGOFollowers,
    forgotPasswordNGO,
    resetPasswordNGO,
    getNGOProfile,
    updateNGOProfile
};
