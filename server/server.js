require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');


const PORT = process.env.PORT || 5000;

// Connect to Database
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

// Socket Authentication Middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(app.sessionMiddleware));

io.use((socket, next) => {
    const session = socket.request.session;
    if (session && session.user) {
        socket.user = session.user;
        next();
    } else {
        next(new Error("unauthorized"));
    }
});

// Presence Tracking
const exhibitPresence = {}; // { exhibitId: [ { userId, name, socketId } ] }

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    socket.on("join-exhibit", (exhibitId) => {
        // ideally re-verify purchase here, but session is auth source of truth for now
        socket.join(`exhibit_${exhibitId}`);

        // Update Presence
        if (!exhibitPresence[exhibitId]) exhibitPresence[exhibitId] = [];

        // Avoid duplicate users in list?
        const existingSession = exhibitPresence[exhibitId].find(u => u.userId === socket.user.id);
        if (!existingSession) {
            exhibitPresence[exhibitId].push({
                userId: socket.user.id,
                name: socket.user.name,
                socketId: socket.id
            });
        }

        // Emit presence update to room
        io.to(`exhibit_${exhibitId}`).emit("presence-update", exhibitPresence[exhibitId]);

        console.log(`User ${socket.user.name} joined exhibit ${exhibitId}`);
    });

    socket.on("send-message", ({ exhibitId, message }) => {
        io.to(`exhibit_${exhibitId}`).emit("receive-message", {
            id: Date.now(), // simple ID
            sender: socket.user.name,
            text: message,
            timestamp: new Date()
        });
    });

    socket.on("disconnect", () => {
        // Remove user from all presence lists
        for (const [exhibitId, users] of Object.entries(exhibitPresence)) {
            const index = users.findIndex(u => u.socketId === socket.id);
            if (index !== -1) {
                users.splice(index, 1);
                io.to(`exhibit_${exhibitId}`).emit("presence-update", users);
            }
        }
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
