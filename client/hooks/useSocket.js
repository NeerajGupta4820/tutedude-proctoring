import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url) => {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(url);
    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  return socketRef.current;
};

export default useSocket;
