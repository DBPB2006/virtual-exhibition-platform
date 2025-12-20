const express = require('express');
const router = express.Router();

// Handles incoming contact form submissions from the public
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const ContactRequest = require('../models/ContactRequest');

        const newRequest = new ContactRequest({
            name,
            email,
            subject,
            message,
            status: 'pending' // Default status
        });

        await newRequest.save();

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Contact Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
