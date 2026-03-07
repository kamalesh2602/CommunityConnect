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

module.exports = { registerNGO, loginNGO, getNGOFollowers };
