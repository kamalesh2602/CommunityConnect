const express = require('express');
const router = express.Router();
const { protect, authVolunteer, authNGO } = require('../middleware/authMiddleware');
const {
    sendMessage, getMessages, getVolunteerChats, getNgoChats, getUnreadCount, markAsRead
} = require('../controllers/chatController');

router.route('/send').post(protect, sendMessage);
router.route('/messages/:ngoId/:volunteerId').get(protect, getMessages);
router.route('/volunteer').get(protect, authVolunteer, getVolunteerChats);
router.route('/ngo').get(protect, authNGO, getNgoChats);
router.route('/unread-count').get(protect, getUnreadCount);
router.route('/mark-read/:otherId').put(protect, markAsRead);

module.exports = router;
