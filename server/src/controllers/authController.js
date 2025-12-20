const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registerNewUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'visitor'
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(`[ERROR][AuthController] Register: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.authenticateUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user || user.isDeleted) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account is blocked. Contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        req.session.save((err) => {
            if (err) {
                console.error(`[ERROR][AuthController] Session Save: ${err}`);
                return res.status(500).json({ message: 'Session creation failed' });
            }
            const redirectPath = user.role === 'admin'
                ? '/dashboard/admin'
                : user.role === 'exhibitor'
                    ? '/dashboard/exhibitor'
                    : '/';

            res.status(200).json({
                message: 'Logged in successfully',
                user: req.session.user,
                redirectPath
            });
        });
    } catch (error) {
        console.error(`[ERROR][AuthController] Login: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.googleRegister = async (req, res) => {
    try {
        const { token, role } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        // Verify ID Token
        let googleUser = await verifyGoogleToken(token);
        if (!googleUser) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const { googleId, email, name } = googleUser;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { googleId }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Account already exists. Please log in.' });
        }

        // Create New User
        // STRICT: Allow only 'visitor' or 'exhibitor'
        const allocatedRole = (role === 'exhibitor') ? 'exhibitor' : 'visitor';

        const newUser = new User({
            name,
            email,
            authProvider: 'google',
            googleId,
            role: allocatedRole
        });

        await newUser.save();

        // Create Session
        createSession(req, res, newUser, 'Google Registration Success');

    } catch (error) {
        console.error(`[ERROR][AuthController] Google Register: ${error.message}`);
        res.status(500).json({ message: 'Google registration failed', error: error.message });
    }
};

// Authenticates a user via Google OAuth, handling strict role assignment or validation

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        // Verify ID Token
        let googleUser = await verifyGoogleToken(token);
        if (!googleUser) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const { googleId, email } = googleUser;

        // Find User
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (!user) {
            return res.status(403).json({
                message: 'Account not registered. Please sign up first.',
                needRegistration: true
            });
        }

        // Security Checks
        if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked.' });
        if (user.isDeleted) return res.status(403).json({ message: 'Account deleted.' });

        // Link Google ID if missing (seamless integration for email-registered users)
        if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = 'mixed'; // Denote that they have mainly email but linked google
            await user.save();
        }

        // Create Session
        createSession(req, res, user, 'Google Login Success');

    } catch (error) {
        console.error(`[ERROR][AuthController] Google Login: ${error.message}`);
        res.status(500).json({ message: 'Google login failed', error: error.message });
    }
};

// Utility helper functions for token verification and session management


async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
    } catch (error) {
        // Fallback to Access Token if ID Token fails (older implementation support)
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) return null;
            const payload = await response.json();
            return {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            };
        } catch (innerError) {
            return null;
        }
    }
}

function createSession(req, res, user, logMessage) {
    req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };

    req.session.save((err) => {
        if (err) {
            console.error(`[ERROR] Session Save: ${err}`);
            return res.status(500).json({ message: 'Session creation failed' });
        }


        const redirectPath = user.role === 'admin'
            ? '/dashboard/admin'
            : user.role === 'exhibitor'
                ? '/dashboard/exhibitor'
                : '/';

        res.status(200).json({
            message: 'Authentication successful',
            user: req.session.user,
            redirectPath
        });
    });
}

// Terminates the user session and destroys the persistent cookie

exports.terminateSession = (req, res) => {
    const userEmail = req.session?.user?.email || 'unknown';
    req.session.destroy((err) => {
        if (err) {
            console.error(`[ERROR][AuthController] Logout Failed: ${err}`);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};

// Verifies the current session validity and returns authenticated user details

exports.verifySessionStatus = (req, res) => {
    if (req.session && req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
};
