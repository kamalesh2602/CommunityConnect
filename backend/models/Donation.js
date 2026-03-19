const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    amount: { type: Number, required: true },
    message: { type: String },
    paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
