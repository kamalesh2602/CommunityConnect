const Donation = require('../models/Donation');
const Requirement = require('../models/Requirement');
const NGO = require('../models/NGO');

// @route   POST /api/donations
// @access  Private/Volunteer
const createDonation = async (req, res) => {
    try {
        const { ngoId, requirementId, amount, message } = req.body;

        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }

        if (requirement.status === 'fulfilled') {
            return res.status(400).json({ message: 'This requirement has already been fulfilled' });
        }

        const donation = new Donation({
            volunteerId: req.user._id,
            ngoId,
            requirementId,
            amount,
            message
        });

        const createdDonation = await donation.save();
        res.status(201).json(createdDonation);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/donations/volunteer
// @access  Private/Volunteer
const getVolunteerDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ volunteerId: req.user._id })
            .populate('ngoId', 'ngoName email')
            .populate('requirementId', 'title amountNeeded');
        res.json(donations);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/donations/ngo
// @access  Private/NGO
const getNgoDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ ngoId: req.user._id })
            .populate('volunteerId', 'name email phone')
            .populate('requirementId', 'title amountNeeded');
        res.json(donations);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createDonation, getVolunteerDonations, getNgoDonations };
