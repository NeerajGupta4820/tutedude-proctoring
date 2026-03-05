// config/socketHandler.js
import chatService from '../services/chat.service.js';
import {
  setupWhiteboardHandlers,
  cleanupWhiteboardRoom,
} from './sockethandler/whiteboardHandler.js';
import {
  setupQuestionHandlers,
  cleanupQuestionRoom,
} from './sockethandler/questionHandler.js';
import { setupAIHandlers } from './sockethandler/aiHandler.js';
const interviewRooms = {};
const pendingIceCandidates = {};
const typingUsers = {};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // Setup handlers
    setupWhiteboardHandlers(io, socket);
    setupQuestionHandlers(io, socket);
    setupAIHandlers(io, socket);
    // ========================================
    // ROOM MANAGEMENT EVENTS
    // ========================================

    socket.on('joinInterview', ({ meetingId, user, isCamOn, isMicOn }) => {
      if (!user || !user.id) {
        console.error('❌ Invalid user, missing id:', user);
        return;
      }

      socket.join(meetingId);
      socket.meetingId = meetingId;
      socket.userData = user;

      const userWithSocket = {
        ...user,
        socketId: socket.id,
        isCamOn: isCamOn !== undefined ? isCamOn : true,
        isMicOn: isMicOn !== undefined ? isMicOn : true,
      };

      if (!interviewRooms[meetingId]) {
        interviewRooms[meetingId] = [];
      } else {
        // Remove stale connection for the SAME SOCKET ID if it somehow exists
        interviewRooms[meetingId] = interviewRooms[meetingId].filter(
          (u) => u.socketId !== socket.id
        );
      }

      interviewRooms[meetingId].push(userWithSocket);

      console.log(
        `👤 User ${user.name} joined room ${meetingId} (Cam: ${userWithSocket.isCamOn}, Mic: ${userWithSocket.isMicOn})`
      );

      // 1. Notify the new joiner about who is ALREADY there
      const existingParticipants = interviewRooms[meetingId].filter(
        (u) => u.socketId !== socket.id
      );
      socket.emit('existingParticipants', existingParticipants);

      // 2. Notify OTHERS that someone new joined
      socket.to(meetingId).emit('newParticipant', userWithSocket);

      // 3. Update room-wide participant list (for UI consistency)
      io.to(meetingId).emit('participantsUpdate', interviewRooms[meetingId]);
    });

    socket.on('readyToConnect', ({ meetingId }) => {
      const room = interviewRooms[meetingId];
      if (room) {
        const otherParticipants = room.filter((u) => u.socketId !== socket.id);
        otherParticipants.forEach((p) => {
          io.to(p.socketId).emit('sendOfferTo', {
            targetSocketId: socket.id,
            targetUser: socket.userData,
          });
        });
      }
    });

    socket.on('leaveInterview', ({ meetingId, userId }) => {
      handleUserLeave(socket, meetingId, userId, io);
    });

    // ========================================
    // WEBRTC SIGNALING EVENTS
    // ========================================

    socket.on('offer', ({ meetingId, offer, to }) => {
      io.to(to).emit('offer', {
        offer,
        from: socket.id,
        fromUser: socket.userData,
      });
    });

    socket.on('answer', ({ meetingId, answer, to }) => {
      io.to(to).emit('answer', { answer, from: socket.id });

      if (pendingIceCandidates[to]?.[socket.id]) {
        pendingIceCandidates[to][socket.id].forEach((candidate) => {
          io.to(to).emit('ice-candidate', { candidate, from: socket.id });
        });
        delete pendingIceCandidates[to][socket.id];
      }
    });

    socket.on('ice-candidate', ({ meetingId, candidate, to }) => {
      io.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });

    // ========================================
    // MEDIA STATE EVENTS
    // ========================================

    socket.on('mediaStateUpdate', ({ meetingId, isCamOn, isMicOn }) => {
      const room = interviewRooms[meetingId];
      if (room) {
        const participant = room.find((p) => p.socketId === socket.id);
        if (participant) {
          participant.isCamOn = isCamOn;
          participant.isMicOn = isMicOn;

          // Broadcast update to others
          socket.to(meetingId).emit('participantMediaUpdate', {
            socketId: socket.id,
            isCamOn,
            isMicOn,
          });
        }
      }
    });

    // ========================================
    // CHAT EVENTS
    // ========================================

    socket.on(
      'sendMessage',
      async ({ meetingId, message, messageType, codeSnippet, attachment }) => {
        try {
          const user = socket.userData;
          if (!user) {
            socket.emit('messageError', { error: 'User not authenticated' });
            return;
          }

          const messageData = {
            meeting: meetingId,
            roomId: meetingId,
            sender: {
              userId: user.id,
              userType: user.role === 'candidate' ? 'Candidate' : 'User',
              name: user.name,
              avatar: user.avatar || null,
            },
            message,
            messageType: messageType || 'text',
            codeSnippet: codeSnippet || null,
            attachment: attachment || null,
          };

          const savedMessage = await chatService.saveMessage(messageData);

          console.log(
            `💬 Message saved: ${savedMessage._id} in room ${meetingId}`
          );

          io.to(meetingId).emit('newMessage', {
            _id: savedMessage._id,
            meeting: savedMessage.meeting,
            roomId: savedMessage.roomId,
            sender: savedMessage.sender,
            message: savedMessage.message,
            messageType: savedMessage.messageType,
            codeSnippet: savedMessage.codeSnippet,
            attachment: savedMessage.attachment,
            createdAt: savedMessage.createdAt,
          });

          if (typingUsers[meetingId]?.[user.id]) {
            delete typingUsers[meetingId][user.id];
            socket.to(meetingId).emit('userStoppedTyping', {
              userId: user.id,
              userName: user.name,
            });
          }
        } catch (error) {
          console.error('❌ Error saving message:', error);
          socket.emit('messageError', {
            error: 'Failed to send message',
            originalMessage: message,
          });
        }
      }
    );

    socket.on('typing', ({ meetingId }) => {
      const user = socket.userData;
      if (!user) return;

      if (!typingUsers[meetingId]) {
        typingUsers[meetingId] = {};
      }

      typingUsers[meetingId][user.id] = {
        userId: user.id,
        userName: user.name,
        timestamp: Date.now(),
      };

      socket.to(meetingId).emit('userTyping', {
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on('stopTyping', ({ meetingId }) => {
      const user = socket.userData;
      if (!user) return;

      if (typingUsers[meetingId]?.[user.id]) {
        delete typingUsers[meetingId][user.id];
      }

      socket.to(meetingId).emit('userStoppedTyping', {
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on('deleteMessage', async ({ meetingId, messageId }) => {
      try {
        const user = socket.userData;
        if (!user) {
          socket.emit('messageError', { error: 'User not authenticated' });
          return;
        }

        await chatService.deleteMessage(messageId, user.id);

        io.to(meetingId).emit('messageDeleted', { messageId });
      } catch (error) {
        console.error('❌ Error deleting message:', error);
        socket.emit('messageError', {
          error: error.message || 'Failed to delete message',
        });
      }
    });

    socket.on('markAsRead', async ({ meetingId }) => {
      try {
        const user = socket.userData;
        if (!user) return;

        await chatService.markAsRead(meetingId, user.id);

        socket.to(meetingId).emit('messagesRead', {
          userId: user.id,
          userName: user.name,
        });
      } catch (error) {
        console.error('❌ Error marking as read:', error);
      }
    });

    // ========================================
    // CONNECTION LIFECYCLE EVENTS
    // ========================================

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
      delete pendingIceCandidates[socket.id];
    });

    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
};

function handleUserLeave(socket, meetingId, userId, io) {
  socket.leave(meetingId);

  if (typingUsers[meetingId]?.[userId]) {
    delete typingUsers[meetingId][userId];
    io.to(meetingId).emit('userStoppedTyping', { userId });
  }

  if (interviewRooms[meetingId]) {
    interviewRooms[meetingId] = interviewRooms[meetingId].filter(
      (u) => u.id !== userId
    );

    io.to(meetingId).emit('participantsUpdate', interviewRooms[meetingId]);
    io.to(meetingId).emit('participantLeft', { odlid: socket.id });

    console.log(
      `👥 Room ${meetingId} has ${interviewRooms[meetingId].length} participants`
    );

    if (interviewRooms[meetingId].length === 0) {
      delete interviewRooms[meetingId];
      delete typingUsers[meetingId];
      cleanupWhiteboardRoom(meetingId);
      cleanupQuestionRoom(meetingId);
      console.log(`🗑️ Room ${meetingId} deleted (empty)`);
    }
  }
}

export default setupSocketHandlers;
