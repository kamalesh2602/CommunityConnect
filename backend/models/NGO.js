const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ngoSchema = new mongoose.Schema({
    ngoName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    panNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    verified: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

ngoSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

ngoSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

ngoSchema.methods.getResetPasswordToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('NGO', ngoSchema);
