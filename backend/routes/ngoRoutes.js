const express = require('express');
const router = express.Router();
const { protect, authNGO } = require('../middleware/authMiddleware');
const {
<<<<<<< Updated upstream
    registerNGO, loginNGO, getNGOFollowers
=======
    registerNGO, loginNGO, getNGOFollowers, forgotPasswordNGO, resetPasswordNGO, getNGOProfile, updateNGOProfile
>>>>>>> Stashed changes
} = require('../controllers/ngoController');

router.post('/register', registerNGO);
router.post('/login', loginNGO);

router.route('/followers').get(protect, authNGO, getNGOFollowers);
router.route('/profile').get(protect, authNGO, getNGOProfile).put(protect, authNGO, updateNGOProfile);

module.exports = router;
