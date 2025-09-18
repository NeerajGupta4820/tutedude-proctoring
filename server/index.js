import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/log.js';
import reportRoutes from './routes/report.js';
import meetingRoutes from './routes/meeting.js';
import meetingSocketRoutes from './routes/meetingSocket.js';

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/log', logRoutes);
app.use('/api/report', reportRoutes);

const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: '*' } });

meetingSocketRoutes(io); // Attach meeting socket logic

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || '', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
