const express = require('express');
const router = express.Router();
const { protect, authNGO } = require('../middleware/authMiddleware');
const {
    registerNGO, loginNGO, getNGOFollowers, forgotPasswordNGO, resetPasswordNGO, getNGOProfile, updateNGOProfile

} = require('../controllers/ngoController');

router.post('/register', registerNGO);
router.post('/login', loginNGO);
router.post('/forgot-password', forgotPasswordNGO);
router.put('/reset-password/:resetToken', resetPasswordNGO);

router.route('/followers').get(protect, authNGO, getNGOFollowers);
router.route('/profile').get(protect, authNGO, getNGOProfile).put(protect, authNGO, updateNGOProfile);

module.exports = router;
