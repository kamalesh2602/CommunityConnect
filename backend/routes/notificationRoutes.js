const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationAsRead } = require('../controllers/notificationController');

router.route('/').get(protect, getNotifications);
router.route('/read/:id').patch(protect, markNotificationAsRead);

module.exports = router;
