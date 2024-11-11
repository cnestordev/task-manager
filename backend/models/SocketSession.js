const mongoose = require('mongoose');

const socketSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    socketId: { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h'
    }
});

const SocketSession = mongoose.model('SocketSession', socketSessionSchema);
module.exports = SocketSession;
