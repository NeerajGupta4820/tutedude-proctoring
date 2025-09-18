import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/log.js';
import reportRoutes from './routes/report.js';
import meetingRoutes from './routes/meeting.js';

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/log', logRoutes);
app.use('/api/report', reportRoutes);

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Interview room logic
const interviewRooms = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('joinInterview', ({ meetingId, user }) => {
    if (!user.id) {
      console.error('Invalid user, missing id:', user);
      return;
    }
    socket.join(meetingId);
    if (!interviewRooms[meetingId]) interviewRooms[meetingId] = [];
    const userWithSocket = { ...user, socketId: socket.id };
    if (!interviewRooms[meetingId].find(u => u.id === user.id)) {
      interviewRooms[meetingId].push(userWithSocket);
    }
    console.log(`User ${user.name} joined room ${meetingId}, participants:`, interviewRooms[meetingId]);
    io.to(meetingId).emit('participantsUpdate', interviewRooms[meetingId]);
  });

  socket.on('leaveInterview', ({ meetingId, userId }) => {
    socket.leave(meetingId);
    if (interviewRooms[meetingId]) {
      interviewRooms[meetingId] = interviewRooms[meetingId].filter(u => u.id !== userId);
      console.log(`User left room ${meetingId}, participants:`, interviewRooms[meetingId]);
      io.to(meetingId).emit('participantsUpdate', interviewRooms[meetingId]);
    }
  });

  socket.on('disconnecting', () => {
    Object.keys(socket.rooms).forEach(room => {
      if (room !== socket.id && interviewRooms[room]) {
        interviewRooms[room] = interviewRooms[room].filter(u => u.socketId !== socket.id);
        console.log(`Socket ${socket.id} disconnected, updated room ${room}:`, interviewRooms[room]);
        io.to(room).emit('participantsUpdate', interviewRooms[room]);
      }
    });
  });

  socket.on('offer', ({ meetingId, offer, to }) => {
    console.log(`Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ meetingId, answer, to }) => {
    console.log(`Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ meetingId, candidate, to }) => {
    console.log(`Sending ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });
});

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));