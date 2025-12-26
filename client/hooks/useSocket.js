// hooks/useSocket.js
import { useRef, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (roomId, user) => {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);

  // ✅ Initialize socket
  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    console.log('🔌 Initializing socket connection...');

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join room immediately
      if (roomId && user) {
        socket.emit('joinInterview', {
          meetingId: roomId,
          user: { id: user.id, name: user.name, role: user.role },
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      reconnectAttempts.current++;
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('participantsUpdate', (list) => {
      console.log('👥 Participants update:', list.length);
      setParticipants(list);
    });

    socketRef.current = socket;
    return socket;
  }, [roomId, user]);

  // ✅ Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (roomId && user) {
        socketRef.current.emit('leaveInterview', {
          meetingId: roomId,
          userId: user.id,
        });
      }
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, [roomId, user]);

  // ✅ Emit ready signal
  const emitReady = useCallback(() => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('readyToConnect', { meetingId: roomId });
    }
  }, [roomId]);

  // ✅ Get socket instance
  const getSocket = useCallback(() => {
    return socketRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    participants,
    initSocket,
    disconnect,
    emitReady,
    getSocket,
  };
};

export default useSocket;
