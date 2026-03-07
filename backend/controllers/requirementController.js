const Requirement = require('../models/Requirement');

// @route   POST /api/requirements
// @access  Private/NGO
const createRequirement = async (req, res) => {
    try {
        const { title, description, amountNeeded, deadline } = req.body;
        const requirement = new Requirement({
            ngoId: req.user._id,
            title,
            description,
            amountNeeded,
            deadline
        });
        const createdRequirement = await requirement.save();
        res.status(201).json(createdRequirement);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/requirements
// @access  Private/Volunteer
const getRequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find({}).populate({
            path: 'ngoId',
            match: { verified: true },
            select: 'ngoName email verified'
        });
        const verifiedRequirements = requirements.filter(req => req.ngoId !== null);
        res.json(verifiedRequirements);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/requirements/ngo/:id
// @access  Public or NGO
const getNGORequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find({ ngoId: req.params.id });
        res.json(requirements);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createRequirement, getRequirements, getNGORequirements };
