const express = require('express');
const router = express.Router();
const { protect, authNGO } = require('../middleware/authMiddleware');
const {
    createRequirement, 
    getRequirements, 
    getRequirementFeed,
    getRequirementById,
    getNGORequirements,
    updateRequirementStatus
} = require('../controllers/requirementController');

router.route('/').get(getRequirements).post(protect, authNGO, createRequirement);
router.route('/feed').get(protect, getRequirementFeed);
router.route('/ngo/:id').get(getNGORequirements);
router.route('/:id').get(getRequirementById);
router.route('/:id/status').patch(protect, authNGO, updateRequirementStatus);

module.exports = router;
