const express = require('express');
const router = express.Router();
const { protect, authVolunteer, authNGO } = require('../middleware/authMiddleware');
const {
    createDonation, getVolunteerDonations, getNgoDonations
} = require('../controllers/donationController');

router.route('/').post(protect, authVolunteer, createDonation);
router.route('/volunteer').get(protect, authVolunteer, getVolunteerDonations);
router.route('/ngo').get(protect, authNGO, getNgoDonations);

module.exports = router;
