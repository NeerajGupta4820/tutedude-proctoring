// index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import setupSocketHandlers from './config/socketHandler.js';
import authRoutes from './routes/auth.js';
import candidateRoutes from './routes/candidateRoutes.js';
import interviewerRoutes from './routes/interviewerRoutes.js';
import logRoutes from './routes/logRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import interviewResultRoutes from './routes/interviewResultRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import connectDB from './db/dbconfig.js';

dotenv.config();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/interviewer', interviewerRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/log', logRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/interview-results', interviewResultRoutes);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  });
});

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // ✅ Faster reconnection settings
  pingTimeout: 30000,
  pingInterval: 10000,
  transports: ['websocket', 'polling'],
});

// ✅ Setup socket handlers from separate file
setupSocketHandlers(io);

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
