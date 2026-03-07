const express = require('express');
const router = express.Router();
const { protect, authAdmin } = require('../middleware/authMiddleware');
const {
    loginAdmin,
    getVolunteers, deleteVolunteer, updateVolunteer,
    getNGOs, deleteNGO, verifyNGO, updateNGO,
    getDashboardStats
} = require('../controllers/adminController');

router.post('/login', loginAdmin);

router.route('/volunteers').get(protect, authAdmin, getVolunteers);
router.route('/volunteers/:id').put(protect, authAdmin, updateVolunteer).delete(protect, authAdmin, deleteVolunteer);

router.route('/ngos').get(protect, authAdmin, getNGOs);
router.route('/ngos/:id').put(protect, authAdmin, updateNGO).delete(protect, authAdmin, deleteNGO);
router.route('/ngos/:id/verify').put(protect, authAdmin, verifyNGO);

router.route('/dashboard').get(protect, authAdmin, getDashboardStats);

module.exports = router;
