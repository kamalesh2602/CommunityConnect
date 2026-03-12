const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true }
}, { timestamps: true });

// Ensure unique follow relationships
followSchema.index({ volunteerId: 1, ngoId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
