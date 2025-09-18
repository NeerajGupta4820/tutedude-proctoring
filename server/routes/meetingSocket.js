// routes/meetingSocket.js

export default function meetingSocketRoutes(io) {
  // Socket.IO logic for meeting rooms
  const meetingParticipants = {};
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('joinMeeting', ({ meetingId, userId, name, email, role }) => {
      socket.join(meetingId);
      // Add participant to room
      if (!meetingParticipants[meetingId]) meetingParticipants[meetingId] = [];
      // Remove if already exists
      meetingParticipants[meetingId] = meetingParticipants[meetingId].filter(p => p.userId !== userId);
      meetingParticipants[meetingId].push({ userId, name, email, role, socketId: socket.id });
      // Broadcast updated list
      io.to(meetingId).emit('participantsUpdate', meetingParticipants[meetingId]);
    });

    socket.on('leaveMeeting', ({ meetingId, userId }) => {
      if (meetingParticipants[meetingId]) {
        meetingParticipants[meetingId] = meetingParticipants[meetingId].filter(p => p.userId !== userId);
        io.to(meetingId).emit('participantsUpdate', meetingParticipants[meetingId]);
      }
      socket.leave(meetingId);
    });

    socket.on('disconnect', () => {
      // Remove participant from all rooms
      Object.keys(meetingParticipants).forEach(meetingId => {
        const before = meetingParticipants[meetingId].length;
        meetingParticipants[meetingId] = meetingParticipants[meetingId].filter(p => p.socketId !== socket.id);
        if (meetingParticipants[meetingId].length !== before) {
          io.to(meetingId).emit('participantsUpdate', meetingParticipants[meetingId]);
        }
      });
      console.log('Socket disconnected:', socket.id);
    });
  });
}
