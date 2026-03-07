const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amountNeeded: { type: Number, required: true },
    deadline: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);
