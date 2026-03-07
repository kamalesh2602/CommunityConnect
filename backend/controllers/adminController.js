const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const Requirement = require('../models/Requirement');
const generateToken = require('../utils/generateToken');

// Admin Login
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            res.json({
                username,
                role: 'admin',
                token: generateToken('admin_id', 'admin')
            });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Manage Volunteers
const getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find({}).select('-password');
        res.json(volunteers);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteVolunteer = async (req, res) => {
    try {
        await Volunteer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Volunteer removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (volunteer) {
            volunteer.name = req.body.name || volunteer.name;
            volunteer.email = req.body.email || volunteer.email;
            volunteer.phone = req.body.phone || volunteer.phone;
            volunteer.aadhar = req.body.aadhar || volunteer.aadhar;
            const updatedVolunteer = await volunteer.save();
            res.json(updatedVolunteer);
        } else {
            res.status(404).json({ message: 'Volunteer not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Manage NGOs
const getNGOs = async (req, res) => {
    try {
        const ngos = await NGO.find({}).select('-password');
        res.json(ngos);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteNGO = async (req, res) => {
    try {
        await NGO.findByIdAndDelete(req.params.id);
        res.json({ message: 'NGO removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyNGO = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id);
        if (ngo) {
            ngo.verified = !ngo.verified;
            const updatedNGO = await ngo.save();
            res.json(updatedNGO);
        } else {
            res.status(404).json({ message: 'NGO not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateNGO = async (req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id);
        if (ngo) {
            ngo.ngoName = req.body.ngoName || ngo.ngoName;
            ngo.email = req.body.email || ngo.email;
            ngo.phone = req.body.phone || ngo.phone;
            ngo.registrationNumber = req.body.registrationNumber || ngo.registrationNumber;
            ngo.panNumber = req.body.panNumber || ngo.panNumber;
            ngo.address = req.body.address || ngo.address;
            const updatedNGO = await ngo.save();
            res.json(updatedNGO);
        } else {
            res.status(404).json({ message: 'NGO not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const totalVolunteers = await Volunteer.countDocuments();
        const totalNGOs = await NGO.countDocuments();
        const totalRequirements = await Requirement.countDocuments();

        const donations = await Donation.find({});
        const totalDonationsAmount = donations.reduce((acc, curr) => acc + curr.amount, 0);
        const totalDonationsCount = donations.length;

        res.json({
            totalVolunteers,
            totalNGOs,
            totalRequirements,
            totalDonationsCount,
            totalDonationsAmount
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { loginAdmin, getVolunteers, deleteVolunteer, updateVolunteer, getNGOs, deleteNGO, verifyNGO, updateNGO, getDashboardStats };
