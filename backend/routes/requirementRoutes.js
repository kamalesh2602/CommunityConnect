const express = require('express');
const router = express.Router();
const { protect, authNGO } = require('../middleware/authMiddleware');
const {
    createRequirement, getRequirements, getNGORequirements
} = require('../controllers/requirementController');

router.route('/').get(getRequirements).post(protect, authNGO, createRequirement);
router.route('/ngo/:id').get(getNGORequirements);

module.exports = router;
