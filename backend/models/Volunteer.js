const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const volunteerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    aadhar: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    followedNGOs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }],
}, { timestamps: true });

volunteerSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

volunteerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Volunteer', volunteerSchema);
