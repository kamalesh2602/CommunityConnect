const express = require('express');
const router = express.Router();
const { protect, authNGO } = require('../middleware/authMiddleware');
const {
    registerNGO, loginNGO, getNGOFollowers
} = require('../controllers/ngoController');

router.post('/register', registerNGO);
router.post('/login', loginNGO);

router.route('/followers').get(protect, authNGO, getNGOFollowers);

module.exports = router;
