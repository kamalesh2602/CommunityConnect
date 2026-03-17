const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// --- 1. AUTHENTICATION ---

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

        res.status(201).json({
            _id: volunteer._id,
            name: volunteer.name,
            email: volunteer.email,
            role: 'volunteer',
            token: generateToken(volunteer._id, 'volunteer')
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

// --- 2. PROFILE MANAGEMENT ---

const getVolunteerProfile = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.user._id).select('-password');
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        res.json(volunteer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateVolunteerProfile = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.user._id);

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        volunteer.name = req.body.name || volunteer.name;
        volunteer.email = req.body.email || volunteer.email;
        volunteer.phone = req.body.phone || volunteer.phone;
        volunteer.aadhar = req.body.aadhar || volunteer.aadhar;

        if (req.body.password) {
            volunteer.password = req.body.password;
        }

        const updatedVolunteer = await volunteer.save();

        res.json({
            _id: updatedVolunteer._id,
            name: updatedVolunteer.name,
            email: updatedVolunteer.email,
            phone: updatedVolunteer.phone,
            aadhar: updatedVolunteer.aadhar,
            role: 'volunteer',
            token: generateToken(updatedVolunteer._id, 'volunteer')
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 3. NGO FEATURES ---

const getVerifiedNGOs = async (req, res) => {
    try {
        const verifiedNGOs = await NGO.find({ verified: true }).select('-password');
        res.json(verifiedNGOs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

// --- 4. PASSWORD RECOVERY (EMAIL BASED) ---

const forgotPasswordVolunteer = async (req, res) => {
    try {
        const { email } = req.body;

        const volunteer = await Volunteer.findOne({ email });

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        const resetToken = volunteer.getResetPasswordToken();
        await volunteer.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}?role=volunteer`;

        console.log("RESET LINK:", resetUrl);

        res.json({
            message: "Reset link generated (check backend console)"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        volunteer.password = req.body.password;
        volunteer.resetPasswordToken = undefined;
        volunteer.resetPasswordExpire = undefined;

        await volunteer.save();

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- EXPORTS ---

module.exports = {
    registerVolunteer,
    loginVolunteer,
    getVolunteerProfile,
    updateVolunteerProfile,
    getVerifiedNGOs,
    followNGO,
    getFollowedNGOs,
    forgotPasswordVolunteer,
    resetPasswordVolunteer
};