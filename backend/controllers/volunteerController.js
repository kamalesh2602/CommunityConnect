const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const generateToken = require('../utils/generateToken');

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
        const volunteer = await Volunteer.findById(req.user._id).populate('followedNGOs', '-password');
        res.json(volunteer.followedNGOs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Verified NGOs
const getVerifiedNGOs = async (req, res) => {
    try {
        const verifiedNGOs = await NGO.find({ verified: true }).select('-password');
        res.json(verifiedNGOs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerVolunteer, loginVolunteer, followNGO, getFollowedNGOs, getVerifiedNGOs };
