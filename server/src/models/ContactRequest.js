const mongoose = require('mongoose');

// Schema for storing contact form submissions, specifically exhibitor requests
const contactRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'ignored'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    }
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
