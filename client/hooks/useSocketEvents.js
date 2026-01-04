// hooks/useSocketEvents.js
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
  setPanelSize, // Optional - for syncing panel size
}) => {
  useEffect(() => {
    if (!socket || !meetingId) return;

    // Request current state when connecting
    socket.emit('whiteboard-request-state', { meetingId });

    // Handle Draw
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

    // Handle Shape
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

    // Handle Text
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

    // Handle Clear
    const handleClear = () => {
      clearCanvasWithWhite(canvasRef.current);
      setStickyNotes([]);
    };

    // Handle Undo
    const handleUndoRemote = (data) => {
      if (data.canvasData) {
        loadCanvasFromData(canvasRef.current, data.canvasData);
      }
    };

    // Handle Redo
    const handleRedoRemote = (data) => {
      if (data.canvasData) {
        loadCanvasFromData(canvasRef.current, data.canvasData);
      }
    };

    // Handle Cursor
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

    // Handle Cursor Leave
    const handleCursorLeave = ({ socketId }) => {
      setRemoteCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    };

    // Handle Lock
    const handleLock = (data) => {
      setIsLocked(data.locked);
    };

    // Handle Sticky Notes
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

    // Handle Load State (includes panel size)
    const handleLoadState = ({ canvasData, panelSize, isLocked }) => {
      if (canvasData) {
        loadCanvasFromData(canvasRef.current, canvasData);
      }
      if (isLocked !== undefined) {
        setIsLocked(isLocked);
      }
      // Panel size is handled in InterviewScreen.jsx
    };

    // Handle Full Sync
    const handleFullSync = ({ canvasData }) => {
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
    socket.on('whiteboard-full-sync', handleFullSync);

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
      socket.off('whiteboard-full-sync', handleFullSync);
    };
  }, [
    socket,
    meetingId,
    canvasRef,
    setRemoteCursors,
    setIsLocked,
    setStickyNotes,
  ]);

  // Emit Draw
  const emitDraw = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-draw', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  // Emit Shape
  const emitShape = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-shape', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  // Emit Text
  const emitText = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-text', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  // Emit Clear
  const emitClear = useCallback(() => {
    if (socket && meetingId) {
      socket.emit('whiteboard-clear', { meetingId });
    }
  }, [socket, meetingId]);

  // Emit Cursor
  const emitCursor = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-cursor', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  // Emit Lock
  const emitLock = useCallback(
    (locked) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-lock', { meetingId, locked });
      }
    },
    [socket, meetingId]
  );

  // Emit Sticky
  const emitSticky = useCallback(
    (data) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-sticky', { meetingId, ...data });
      }
    },
    [socket, meetingId]
  );

  // Emit Panel Resize
  const emitPanelResize = useCallback(
    (size) => {
      if (socket && meetingId) {
        socket.emit('whiteboard-resize', { meetingId, size });
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
    emitPanelResize,
  };
};

export default useSocketEvents;
