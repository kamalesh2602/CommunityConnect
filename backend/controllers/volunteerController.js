const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendemails');
const crypto = require('crypto');

// Register Volunteer
const registerVolunteer = async (req, res) => {
    try {
        const { name, email, aadhar, phone, password } = req.body;

        const userExists = await Volunteer.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Volunteer already exists' });
        }

        const volunteer = await Volunteer.create({
            name, email, aadhar, phone, password
        });

        if (volunteer) {
            res.status(201).json({
                _id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                role: 'volunteer',
                token: generateToken(volunteer._id, 'volunteer')
            });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Login Volunteer
const loginVolunteer = async (req, res) => {
    try {
        const { email, password } = req.body;

        const volunteer = await Volunteer.findOne({ email });

        if (volunteer && (await volunteer.matchPassword(password))) {
            res.json({
                _id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                role: 'volunteer',
                token: generateToken(volunteer._id, 'volunteer')
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Follow NGO
const followNGO = async (req, res) => {
    try {
        const { ngoId } = req.body;

        const volunteer = await Volunteer.findById(req.user._id);
        const ngo = await NGO.findById(ngoId);

        if (!ngo) return res.status(404).json({ message: 'NGO not found' });

        if (!volunteer.followedNGOs.includes(ngoId)) {

            volunteer.followedNGOs.push(ngoId);
            await volunteer.save();

            ngo.followers.push(volunteer._id);
            await ngo.save();
        }

        res.json({ message: 'NGO followed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get Followed NGOs
const getFollowedNGOs = async (req, res) => {
    try {
        const volunteer = await Volunteer
            .findById(req.user._id)
            .populate('followedNGOs', '-password');

        res.json(volunteer.followedNGOs);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get Verified NGOs
const getVerifiedNGOs = async (req, res) => {
    try {

        const verifiedNGOs = await NGO
            .find({ verified: true })
            .select('-password');

        res.json(verifiedNGOs);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Forgot Password
const forgotPasswordVolunteer = async (req, res) => {

    try {

        const { email } = req.body;

        const volunteer = await Volunteer.findOne({ email });

        if (!volunteer) {
            return res.status(404).json({
                message: 'Volunteer not found with this email'
            });
        }

        // generate reset token
        const resetToken = volunteer.getResetPasswordToken();

        await volunteer.save({ validateBeforeSave: false });

        // reset link
        const resetUrl =
            `http://localhost:5173/reset-password/${resetToken}?role=volunteer`;

        const message = `
You requested a password reset.

Click the link below to reset your password:

${resetUrl}

If you did not request this, please ignore this email.
`;

        // send email
        await sendEmail(
            volunteer.email,
            "Volunteer Password Reset",
            message
        );

        res.json({
            message: "Password reset link sent to your email"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error sending email"
        });
    }
};



// Reset Password
const resetPasswordVolunteer = async (req, res) => {

    try {

        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const volunteer = await Volunteer.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!volunteer) {
            return res.status(400).json({
                message: 'Invalid or expired reset token'
            });
        }

        volunteer.password = req.body.password;

        volunteer.resetPasswordToken = undefined;
        volunteer.resetPasswordExpire = undefined;

        await volunteer.save();

        res.json({
            message: 'Password reset successful'
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    registerVolunteer,
    loginVolunteer,
    followNGO,
    getFollowedNGOs,
    getVerifiedNGOs,
    forgotPasswordVolunteer,
    resetPasswordVolunteer
};