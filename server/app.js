const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo').default;
const authRoutes = require('./src/routes/authRoutes');
const exhibitionRoutes = require('./src/routes/exhibitionRoutes');

const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'dev_fallback_secret', // Ideally, fail if missing in prod
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/virtual_exhibition',
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
});

app.use(sessionMiddleware);
app.sessionMiddleware = sessionMiddleware;

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/exhibitor', require('./src/routes/exhibitorRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/contact', require('./src/routes/contactRoutes'));
app.use('/api/verification', require('./src/routes/verificationRoutes'));

app.get('/health', (req, res) => {
    res.json({ status: "Server is running" });
});

module.exports = app;
