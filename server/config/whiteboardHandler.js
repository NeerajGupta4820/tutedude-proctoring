// config/whiteboardHandler.js

const whiteboardStates = {};
const whiteboardSettings = {};

export const setupWhiteboardHandlers = (io, socket) => {
  // 1️⃣ Drawing Event
  socket.on('whiteboard-draw', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ whiteboard-draw: Missing meetingId');
      return;
    }

    console.log(`🖌️ Draw in room ${meetingId} by ${user?.name || 'Unknown'}`);

    socket.to(meetingId).emit('whiteboard-draw', {
      from: data.from,
      to: data.to,
      color: data.color,
      lineWidth: data.lineWidth,
      tool: data.tool,
      opacity: data.opacity || 1,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 2️⃣ Shape Event
  socket.on('whiteboard-shape', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ whiteboard-shape: Missing meetingId');
      return;
    }

    console.log(`📐 Shape [${data.shape}] in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-shape', {
      shape: data.shape,
      startPos: data.startPos,
      endPos: data.endPos,
      color: data.color,
      lineWidth: data.lineWidth,
      fillColor: data.fillColor || 'transparent',
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 3️⃣ Text Event
  socket.on('whiteboard-text', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ whiteboard-text: Missing meetingId');
      return;
    }

    console.log(`✏️ Text in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-text', {
      position: data.position,
      text: data.text,
      color: data.color,
      fontSize: data.fontSize || 18,
      fontFamily: data.fontFamily || 'Arial',
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 4️⃣ Code Block Event
  socket.on('whiteboard-code', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`💻 Code block in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-code', {
      position: data.position,
      code: data.code,
      language: data.language || 'javascript',
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 5️⃣ Clear Canvas
  socket.on('whiteboard-clear', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`🗑️ Canvas cleared in room ${meetingId}`);

    if (whiteboardStates[meetingId]) {
      delete whiteboardStates[meetingId];
    }

    socket.to(meetingId).emit('whiteboard-clear', {
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 6️⃣ Undo Event
  socket.on('whiteboard-undo', (data) => {
    const { meetingId, historyIndex, canvasData } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`↩️ Undo in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-undo', {
      historyIndex: historyIndex,
      canvasData: canvasData,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 7️⃣ Redo Event
  socket.on('whiteboard-redo', (data) => {
    const { meetingId, historyIndex, canvasData } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`↪️ Redo in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-redo', {
      historyIndex: historyIndex,
      canvasData: canvasData,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 8️⃣ Color Change
  socket.on('whiteboard-color-change', (data) => {
    const { meetingId, color, colorType } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`🎨 Color changed to ${color} in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-color-change', {
      color: color,
      colorType: colorType,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 9️⃣ Tool Change
  socket.on('whiteboard-tool-change', (data) => {
    const { meetingId, tool } = data;
    const user = socket.userData;

    if (!meetingId) return;

    socket.to(meetingId).emit('whiteboard-tool-change', {
      tool: tool,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 🔟 Line Width Change
  socket.on('whiteboard-linewidth-change', (data) => {
    const { meetingId, lineWidth } = data;
    const user = socket.userData;

    if (!meetingId) return;

    socket.to(meetingId).emit('whiteboard-linewidth-change', {
      lineWidth: lineWidth,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 1️⃣1️⃣ Cursor Position
  socket.on('whiteboard-cursor', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) return;

    socket.to(meetingId).emit('whiteboard-cursor', {
      x: data.x,
      y: data.y,
      name: user?.name || data.name || 'Unknown',
      color: data.color || '#FF6B00',
      tool: data.tool || 'pen',
      socketId: socket.id,
    });
  });

  // 1️⃣2️⃣ Cursor Leave
  socket.on('whiteboard-cursor-leave', (data) => {
    const { meetingId } = data;

    if (!meetingId) return;

    socket.to(meetingId).emit('whiteboard-cursor-leave', {
      socketId: socket.id,
    });
  });

  // 1️⃣3️⃣ Lock/Unlock Whiteboard
  socket.on('whiteboard-lock', (data) => {
    const { meetingId, locked } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(
      `🔒 Whiteboard ${locked ? 'LOCKED' : 'UNLOCKED'} in room ${meetingId}`
    );

    if (!whiteboardSettings[meetingId]) {
      whiteboardSettings[meetingId] = {};
    }
    whiteboardSettings[meetingId].isLocked = locked;

    socket.to(meetingId).emit('whiteboard-lock', {
      locked: locked,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 1️⃣4️⃣ Sticky Notes
  socket.on('whiteboard-sticky', (data) => {
    const { meetingId, action, note, index } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`📝 Sticky ${action} in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-sticky', {
      action: action,
      note: note,
      index: index,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 1️⃣5️⃣ Save Canvas State
  socket.on('whiteboard-save-state', (data) => {
    const { meetingId, canvasData, history, historyIndex } = data;

    if (!meetingId || !canvasData) return;

    whiteboardStates[meetingId] = {
      canvasData: canvasData,
      history: history || [],
      historyIndex: historyIndex || 0,
      savedBy: socket.id,
      savedAt: Date.now(),
    };

    console.log(`💾 Canvas state saved for room ${meetingId}`);
  });

  // 1️⃣6️⃣ Request Canvas State
  socket.on('whiteboard-request-state', (data) => {
    const { meetingId } = data;

    if (!meetingId) return;

    const state = whiteboardStates[meetingId];
    const settings = whiteboardSettings[meetingId];

    if (state) {
      console.log(`📤 Sending whiteboard state to ${socket.id}`);

      socket.emit('whiteboard-load-state', {
        canvasData: state.canvasData,
        history: state.history,
        historyIndex: state.historyIndex,
        savedAt: state.savedAt,
        isLocked: settings?.isLocked || false,
      });
    } else {
      socket.emit('whiteboard-load-state', {
        canvasData: null,
        history: [],
        historyIndex: -1,
        isLocked: settings?.isLocked || false,
      });
    }
  });

  // 1️⃣7️⃣ Full Canvas Sync
  socket.on('whiteboard-full-sync', (data) => {
    const { meetingId, canvasData } = data;
    const user = socket.userData;

    if (!meetingId || !canvasData) return;

    console.log(`🔄 Full sync in room ${meetingId}`);

    whiteboardStates[meetingId] = {
      canvasData: canvasData,
      savedBy: socket.id,
      savedAt: Date.now(),
    };

    socket.to(meetingId).emit('whiteboard-full-sync', {
      canvasData: canvasData,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // 1️⃣8️⃣ Image Add
  socket.on('whiteboard-image', (data) => {
    const { meetingId, imageData, position, size } = data;
    const user = socket.userData;

    if (!meetingId) return;

    console.log(`🖼️ Image added in room ${meetingId}`);

    socket.to(meetingId).emit('whiteboard-image', {
      imageData: imageData,
      position: position,
      size: size,
      socketId: socket.id,
      userName: user?.name || 'Unknown',
    });
  });

  // Handle disconnect - remove cursor
  socket.on('disconnect', () => {
    socket.broadcast.emit('whiteboard-cursor-leave', {
      socketId: socket.id,
    });

    Object.keys(whiteboardSettings).forEach((roomId) => {
      if (whiteboardSettings[roomId]?.[socket.id]) {
        delete whiteboardSettings[roomId][socket.id];
      }
    });
  });
};

export const cleanupWhiteboardRoom = (meetingId) => {
  if (whiteboardStates[meetingId]) {
    delete whiteboardStates[meetingId];
  }
  if (whiteboardSettings[meetingId]) {
    delete whiteboardSettings[meetingId];
  }
  console.log(`🧹 Whiteboard cleaned for room ${meetingId}`);
};

export default setupWhiteboardHandlers;
