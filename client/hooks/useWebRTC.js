import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import React from 'react';

const useWebRTC = (user, meetingId) => {
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    if (!user || !user.id) return;

    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('joinInterview', {
        meetingId,
        user: { id: user.id, name: user.name, role: user.role },
      });
    });

    socketRef.current.on('participantsUpdate', (list) => {
      const newParticipants = list.map(u => ({
        id: u.id,
        name: u.name,
        socketId: u.socketId,
        videoRef: React.createRef(),
        stream: undefined,
      }));
      setParticipants(newParticipants);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveInterview', { meetingId, userId: user.id });
        socketRef.current.disconnect();
      }
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [user, meetingId]);

  return { participants, socketRef };
};

export default useWebRTC;