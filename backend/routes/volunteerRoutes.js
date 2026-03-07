const express = require('express');
const router = express.Router();
const { protect, authVolunteer } = require('../middleware/authMiddleware');
const {
    registerVolunteer, loginVolunteer, followNGO, getFollowedNGOs, getVerifiedNGOs
} = require('../controllers/volunteerController');

router.post('/register', registerVolunteer);
router.post('/login', loginVolunteer);

router.route('/ngos').get(protect, authVolunteer, getVerifiedNGOs);
router.route('/follow').post(protect, authVolunteer, followNGO);
router.route('/followed-ngos').get(protect, authVolunteer, getFollowedNGOs);

module.exports = router;
