require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const sessionConfig = require('./middleware/sessionConfig');
const passport = require('./config/passportConfig');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require("./routes/teamRoutes");
const metricRoutes = require("./routes/metricRoutes");
const SocketSession = require("./models/SocketSession");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 10000;
const mongoose = require("mongoose");

// Connect to Database
connectDB();

// Middleware Setup
// app.use(cors({
//     origin: [process.env.VITE_LOCAL_HOST, process.env.VITE_LOCAL_IP],
//     credentials: true
// }));

const isProduction = process.env.NODE_ENV === "production";

// Store room and users
const rooms = new Map();

// WebSocket Setup
const io = socketIo(server, {
    cors: {
        origin: isProduction
            ? process.env.RENDER_PROD_HOST
            : [process.env.VITE_LOCAL_HOST, process.env.VITE_LOCAL_IP],
        methods: ['GET', 'POST'],
        credentials: true,
        transports: ['websocket', 'polling'],
    },
    allowEIO3: true,
});

const sendMessageToUser = async (userId, data) => {
    try {
        // Find the session for the user
        const session = await SocketSession.findOne({ userId: userId });
        if (session && session.socketIds.length > 0) {
            // Loop through all socketIds and send the message to each connection
            session.socketIds.forEach((socketId) => {
                io.to(socketId).emit(data.event, data.payload);
            });
        }
    } catch (err) {
        console.error('Error sending message to user:', err);
    }
};

io.on('connection', async (socket) => {
    let userId, username, teamId, room;

    try {
        userId = new mongoose.Types.ObjectId(socket.handshake.query.userId);
        username = socket.handshake.query.username;
        teamId = socket.handshake.query.teamId;
    } catch (error) {
        console.error('Invalid userId, username, or teamId provided:', socket.handshake.query);
        return socket.disconnect(true);
    }

    console.log(`User ${username} (ID: ${userId}) connected with socket ID: ${socket.id}`);

    try {
        // Add the new socket.id to the session in the database
        await SocketSession.updateOne(
            { userId: userId },
            { $set: { socketId: socket.id } },
            { upsert: true }
        );

        // Automatically join the user to their team room
        socket.join(teamId);
        console.log(`User ${username} joined team room: ${teamId}`);

        // If the room doesn't exist, create it with a Set
        if (!rooms.has(teamId)) {
            rooms.set(teamId, new Set());
        }

        // Add user to the room
        room = rooms.get(teamId);
        room.add(userId);

        console.log(room);

        // Emit a confirmation message back to the team members
        io.to(teamId).emit('joinedRoom', { message: `${username} successfully joined room ${teamId}`, users: Array.from(room), userId: userId });
    } catch (err) {
        console.error('Error saving socket ID for user:', username, err);
    }

    // Handle task updates
    socket.on('taskUpdated', (task) => {
        const taskId = task._id;
        if (taskId) {
            io.to(teamId).emit('taskUpdated', { task, userId });
            console.log(`User ${username} updated task ${taskId}`);
        } else {
            console.error('Task ID is missing or invalid for user:', username);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', async () => {
        console.log(`User ${username} disconnected with socket ID: ${socket.id}`);
        try {
            await SocketSession.updateOne(
                { userId: userId },
                { $pull: { socketIds: socket.id } }
            );

            if (room) {
                room.delete(userId); // Remove user from the room
                // If no users are in the room, delete the room
                if (room.size === 0) {
                    rooms.delete(teamId);
                }
            }

            // Notify other team members
            io.to(teamId).emit('userLeft', { userId, username });
            console.log(`Socket ID ${socket.id} removed for user ${username}`);
        } catch (err) {
            console.error('Error removing socket ID for user:', username, err);
        }
    });
});

app.set("trust proxy", 1);
app.use(express.json());

// Session and Passport Middleware
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: isProduction ? process.env.RENDER_PROD_HOST : process.env.VITE_LOCAL_HOST,
    credentials: true
}));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/metrics', metricRoutes);

app.get('/', (req, res) => res.send('Server is running.'));

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));
