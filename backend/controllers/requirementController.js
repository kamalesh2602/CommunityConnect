const Requirement = require('../models/Requirement');
const Notification = require('../models/Notification');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs.txt');
const log = (msg) => fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);

// @route   POST /api/requirements
// @access  Private/NGO
const createRequirement = async (req, res) => {
    try {
        log(`Incoming body: ${JSON.stringify(req.body)}`);
        log(`User: ${JSON.stringify(req.user)}`);
        
        const { title, description, amountNeeded, deadline } = req.body;
        const requirement = new Requirement({
            ngoId: req.user._id,
            title,
            description,
            amountNeeded,
            deadline
        });
        const createdRequirement = await requirement.save();

        log(`Requirement created: ${createdRequirement._id}`);

        // Notification System: Trigger notifications for followers
        const ngo = await NGO.findById(req.user._id);
        if (ngo && ngo.followers && ngo.followers.length > 0) {
            log(`Sending notifications to ${ngo.followers.length} followers`);
            const notifications = ngo.followers.map(followerId => ({
                userId: followerId,
                ngoId: req.user._id,
                requirementId: createdRequirement._id,
                message: `New requirement posted by ${ngo.ngoName}: ${title}`
            }));
            await Notification.insertMany(notifications);
            log('Notifications inserted successfully');
        }

        res.status(201).json(createdRequirement);
    } catch (error) { 
        log(`Error in createRequirement: ${error.stack}`);
        console.error('Error in createRequirement:', error);
        res.status(500).json({ message: error.stack }); 
    }
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

// @route   GET /api/requirements/feed
// @access  Private/Volunteer
const getRequirementFeed = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.user._id);
        if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });

        const requirements = await Requirement.find({ 
            ngoId: { $in: volunteer.followedNGOs } 
        }).populate('ngoId', 'ngoName verified')
        .sort({ createdAt: -1 });

        res.json(requirements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/requirements/:id
// @access  Public
const getRequirementById = async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id).populate('ngoId', 'ngoName email verified');
        if (requirement) {
            res.json(requirement);
        } else {
            res.status(404).json({ message: 'Requirement not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/requirements/ngo/:id
// @access  Public or NGO
const getNGORequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find({ ngoId: req.params.id });
        res.json(requirements);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   PATCH /api/requirements/:id/status
// @access  Private/NGO
const updateRequirementStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requirement = await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }

        // Only the NGO that created the requirement can mark it as fulfilled
        if (requirement.ngoId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this requirement' });
        }

        requirement.status = status || requirement.status;
        const updatedRequirement = await requirement.save();
        res.json(updatedRequirement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createRequirement, 
    getRequirements, 
    getRequirementFeed,
    getRequirementById,
    getNGORequirements,
    updateRequirementStatus
};
