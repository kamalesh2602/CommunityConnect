const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    messages: [
        {
            sender: { type: String, enum: ['NGO', 'Volunteer'], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            isRead: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
