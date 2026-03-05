// components/AIChatbot/useAIChatSocket.js
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const useAIChatSocket = ({ onChunk, onDone, onError }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('ai-response-chunk', ({ chunk }) => {
      onChunk(chunk);
    });

    socketRef.current.on('ai-status', ({ status }) => {
      if (status === 'done') {
        onDone();
      }
    });

    socketRef.current.on('ai-error', ({ message }) => {
      onError(message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ✅ FIX: Accept conversationId parameter
  const sendMessage = useCallback(
    (prompt, conversationHistory, conversationId) => {
      if (socketRef.current) {
        socketRef.current.emit('ai-ask-question', {
          prompt,
          conversationHistory,
          conversationId, // ✅ Pass to backend
        });
      }
    },
    []
  );

  return { sendMessage };
};

export default useAIChatSocket;
