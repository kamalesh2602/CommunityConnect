const express = require('express');
const router = express.Router();
const { protect, authVolunteer } = require('../middleware/authMiddleware');
const {
    registerVolunteer, loginVolunteer, followNGO, getFollowedNGOs, getVerifiedNGOs,
    forgotPasswordVolunteer, resetPasswordVolunteer, getVolunteerProfile, updateVolunteerProfile
} = require('../controllers/volunteerController');

router.post('/register', registerVolunteer);
router.post('/login', loginVolunteer);
router.post('/forgot-password', forgotPasswordVolunteer);
router.put('/reset-password/:resetToken', resetPasswordVolunteer);


router.route('/ngos').get(protect, authVolunteer, getVerifiedNGOs);
router.route('/follow').post(protect, authVolunteer, followNGO);
router.route('/followed-ngos').get(protect, authVolunteer, getFollowedNGOs);
router.route('/profile').get(protect, authVolunteer, getVolunteerProfile).put(protect, authVolunteer, updateVolunteerProfile);

module.exports = router;
