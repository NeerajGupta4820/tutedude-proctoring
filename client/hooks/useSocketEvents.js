import { useEffect, useCallback } from 'react';
import {
  drawLine,
  drawShapeOnContext,
  drawText,
  loadCanvasFromData,
  clearCanvasWithWhite,
} from '../utlis/canvasHelpers';

export const useSocketEvents = ({
  socket,
  meetingId,
  canvasRef,
  setRemoteCursors,
  setIsLocked,
  setStickyNotes,
}) => {
  useEffect(() => {
    if (!socket || !meetingId) return;

    socket.emit('whiteboard-request-state', { meetingId });

    const handleDraw = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawLine(
        ctx,
        data.from,
        data.to,
        data.color,
        data.lineWidth,
        data.opacity
      );
    };

    const handleShape = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawShapeOnContext(
        ctx,
        data.shape,
        data.startPos,
        data.endPos,
        data.color,
        data.lineWidth,
        data.fillColor
      );
    };

    const handleText = (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawText(
        ctx,
        data.position,
        data.text,
        data.color,
        data.fontSize,
        data.fontFamily
      );
    };

    const handleClear = () => {
      clearCanvasWithWhite(canvasRef.current);
      setStickyNotes([]);
    };

    const handleUndoRemote = (data) => {
      if (data.canvasData) {
        loadCanvasFromData(canvasRef.current, data.canvasData);
      }
    };

    const handleRedoRemote = (data) => {
      if (data.canvasData) {
        loadCanvasFromData(canvasRef.current, data.canvasData);
      }
    };

    const handleCursor = (data) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.socketId]: {
          x: data.x,
          y: data.y,
          name: data.name,
          color: data.color,
        },
      }));
    };

    const handleCursorLeave = ({ socketId }) => {
      setRemoteCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    };

    const handleLock = (data) => {
      setIsLocked(data.locked);
    };

    const handleSticky = (data) => {
      if (data.action === 'add') {
        setStickyNotes((prev) => [...prev, data.note]);
      } else if (data.action === 'update') {
        setStickyNotes((prev) =>
          prev.map((n, i) => (i === data.index ? data.note : n))
        );
      } else if (data.action === 'delete') {
        setStickyNotes((prev) => prev.filter((_, i) => i !== data.index));
      }
    };

    const handleLoadState = ({ canvasData }) => {
      if (canvasData) {
        loadCanvasFromData(canvasRef.current, canvasData);
      }
    };

    // Subscribe to events
    socket.on('whiteboard-draw', handleDraw);
    socket.on('whiteboard-shape', handleShape);
    socket.on('whiteboard-text', handleText);
    socket.on('whiteboard-clear', handleClear);
    socket.on('whiteboard-undo', handleUndoRemote);
    socket.on('whiteboard-redo', handleRedoRemote);
    socket.on('whiteboard-cursor', handleCursor);
    socket.on('whiteboard-cursor-leave', handleCursorLeave);
    socket.on('whiteboard-lock', handleLock);
    socket.on('whiteboard-sticky', handleSticky);
    socket.on('whiteboard-load-state', handleLoadState);

    // Cleanup
    return () => {
      socket.off('whiteboard-draw', handleDraw);
      socket.off('whiteboard-shape', handleShape);
      socket.off('whiteboard-text', handleText);
      socket.off('whiteboard-clear', handleClear);
      socket.off('whiteboard-undo', handleUndoRemote);
      socket.off('whiteboard-redo', handleRedoRemote);
      socket.off('whiteboard-cursor', handleCursor);
      socket.off('whiteboard-cursor-leave', handleCursorLeave);
      socket.off('whiteboard-lock', handleLock);
      socket.off('whiteboard-sticky', handleSticky);
      socket.off('whiteboard-load-state', handleLoadState);
    };
  }, [
    socket,
    meetingId,
    canvasRef,
    setRemoteCursors,
    setIsLocked,
    setStickyNotes,
  ]);

  // Emit functions
  const emitDraw = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-draw', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  const emitShape = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-shape', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  const emitText = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-text', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  const emitClear = useCallback(() => {
    if (socket && meetingId) {
      socket.emit('whiteboard-clear', { meetingId });
    }
  }, [socket, meetingId]);

  const emitCursor = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-cursor', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  const emitLock = useCallback(
    (locked) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-lock', { meetingId, locked });
      }
    },
    [socket, meetingId]
  );

  const emitSticky = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-sticky', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  return {
    emitDraw,
    emitShape,
    emitText,
    emitClear,
    emitCursor,
    emitLock,
    emitSticky,
  };
};
