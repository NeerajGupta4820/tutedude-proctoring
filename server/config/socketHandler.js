// socketHandler.js
const interviewRooms = {};
const pendingIceCandidates = {}; // Store ICE candidates until connection ready

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // ✅ Join interview with immediate stream request
    socket.on('joinInterview', ({ meetingId, user }) => {
      if (!user || !user.id) {
        console.error('❌ Invalid user, missing id:', user);
        return;
      }

      socket.join(meetingId);
      socket.meetingId = meetingId;
      socket.userData = user;

      if (!interviewRooms[meetingId]) {
        interviewRooms[meetingId] = [];
      }

      const userWithSocket = { ...user, socketId: socket.id };

      // Remove old entry if exists (reconnection case)
      const oldEntry = interviewRooms[meetingId].find((u) => u.id === user.id);
      if (oldEntry) {
        console.log(
          `🔄 User ${user.name} reconnecting, old socket: ${oldEntry.socketId}`
        );
      }

      interviewRooms[meetingId] = interviewRooms[meetingId].filter(
        (u) => u.id !== user.id
      );

      interviewRooms[meetingId].push(userWithSocket);

      console.log(
        `👤 User ${user.name} (${socket.id}) joined room ${meetingId}`
      );
      console.log(
        `👥 Room ${meetingId} has ${interviewRooms[meetingId].length} participants`
      );

      // Notify all participants
      io.to(meetingId).emit('participantsUpdate', interviewRooms[meetingId]);

      // ✅ NEW: Tell new user to request offers from existing participants
      const existingParticipants = interviewRooms[meetingId].filter(
        (u) => u.id !== user.id
      );

      if (existingParticipants.length > 0) {
        console.log(
          `📢 Telling ${user.name} to connect with ${existingParticipants.length} existing participants`
        );
        socket.emit('existingParticipants', existingParticipants);
      }

      // ✅ NEW: Tell existing participants about new user
      socket.to(meetingId).emit('newParticipant', userWithSocket);
    });

    // ✅ Ready to receive - user has media ready
    socket.on('readyToConnect', ({ meetingId }) => {
      console.log(`✅ ${socket.id} is ready to connect in room ${meetingId}`);

      const room = interviewRooms[meetingId];
      if (room) {
        const otherParticipants = room.filter((u) => u.socketId !== socket.id);
        otherParticipants.forEach((p) => {
          // Request each existing participant to send offer
          io.to(p.socketId).emit('sendOfferTo', {
            targetSocketId: socket.id,
            targetUser: socket.userData,
          });
        });
      }
    });

    // Leave interview
    socket.on('leaveInterview', ({ meetingId, userId }) => {
      console.log(`👋 User ${userId} leaving room ${meetingId}`);
      handleUserLeave(socket, meetingId, userId, io);
    });

    // Disconnecting
    socket.on('disconnecting', () => {
      console.log(`🔌 Socket ${socket.id} disconnecting`);

      for (const room of socket.rooms) {
        if (room !== socket.id && interviewRooms[room]) {
          const user = interviewRooms[room].find(
            (u) => u.socketId === socket.id
          );
          if (user) {
            handleUserLeave(socket, room, user.id, io);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      // Clean up pending ICE candidates
      delete pendingIceCandidates[socket.id];
    });

    // ✅ WebRTC Signaling - Offer
    socket.on('offer', ({ meetingId, offer, to }) => {
      console.log(`📤 Offer: ${socket.id} -> ${to}`);
      io.to(to).emit('offer', {
        offer,
        from: socket.id,
        fromUser: socket.userData,
      });
    });

    // ✅ WebRTC Signaling - Answer
    socket.on('answer', ({ meetingId, answer, to }) => {
      console.log(`📤 Answer: ${socket.id} -> ${to}`);
      io.to(to).emit('answer', { answer, from: socket.id });

      // ✅ Send any pending ICE candidates
      if (pendingIceCandidates[to]?.[socket.id]) {
        pendingIceCandidates[to][socket.id].forEach((candidate) => {
          io.to(to).emit('ice-candidate', { candidate, from: socket.id });
        });
        delete pendingIceCandidates[to][socket.id];
      }
    });

    // ✅ WebRTC Signaling - ICE Candidate with buffering
    socket.on('ice-candidate', ({ meetingId, candidate, to }) => {
      console.log(`🧊 ICE: ${socket.id} -> ${to}`);
      io.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });

    // Chat message
    socket.on('chatMessage', ({ meetingId, message, from, timestamp }) => {
      console.log(`💬 Chat in ${meetingId} from ${from}`);
      socket.to(meetingId).emit('chatMessage', { message, from, timestamp });
    });

    // ✅ Ping/Pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
};

function handleUserLeave(socket, meetingId, userId, io) {
  socket.leave(meetingId);

  if (interviewRooms[meetingId]) {
    interviewRooms[meetingId] = interviewRooms[meetingId].filter(
      (u) => u.id !== userId
    );

    io.to(meetingId).emit('participantsUpdate', interviewRooms[meetingId]);
    io.to(meetingId).emit('participantLeft', { odlid: socket.id });

    console.log(
      `👥 Room ${meetingId} now has ${interviewRooms[meetingId].length} participants`
    );

    // Clean up empty rooms
    if (interviewRooms[meetingId].length === 0) {
      delete interviewRooms[meetingId];
      console.log(`🗑️ Room ${meetingId} deleted (empty)`);
    }
  }
}

export default setupSocketHandlers;
