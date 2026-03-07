const Chat = require('../models/Chat');

// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { ngoId, volunteerId, text } = req.body;

        let senderRole = req.user.role === 'admin' ? 'NGO' : (req.user.role === 'ngo' ? 'NGO' : 'Volunteer');
        if (req.user.role === 'volunteer') senderRole = 'Volunteer';

        let chat = await Chat.findOne({ ngoId, volunteerId });

        if (!chat) {
            chat = new Chat({
                ngoId,
                volunteerId,
                messages: []
            });
        }

        chat.messages.push({
            sender: senderRole,
            text
        });

        await chat.save();
        res.status(201).json(chat);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/chat/messages/:ngoId/:volunteerId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { ngoId, volunteerId } = req.params;
        const chat = await Chat.findOne({ ngoId, volunteerId });

        if (chat) {
            res.json(chat.messages);
        } else {
            res.json([]);
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/chat/volunteer
// @access  Private/Volunteer
const getVolunteerChats = async (req, res) => {
    try {
        const chats = await Chat.find({ volunteerId: req.user._id }).populate('ngoId', 'ngoName');
        res.json(chats);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route   GET /api/chat/ngo
// @access  Private/NGO
const getNgoChats = async (req, res) => {
    try {
        const chats = await Chat.find({ ngoId: req.user._id }).populate('volunteerId', 'name');
        res.json(chats);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { sendMessage, getMessages, getVolunteerChats, getNgoChats };
