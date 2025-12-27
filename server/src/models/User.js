const mongoose = require('mongoose');

// Schema representing a user in the system, supporting both local and Google authentication
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local';
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['visitor', 'exhibitor', 'admin'],
        default: 'visitor',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    picture: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: { // Keeping for backward compatibility if needed, but logic will rely on isActive
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'pending'],
        default: 'active'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
