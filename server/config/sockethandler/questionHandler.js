// config/sockethandler/questionHandler.js

const questionSettings = {};
const roomQuestions = {}; // Store questions data per room

export const setupQuestionHandlers = (io, socket) => {
  // ========================================
  // 1️⃣ ADMIN SYNCS QUESTIONS TO ROOM
  // ========================================
  socket.on('question-sync-data', (data) => {
    const { meetingId, questions } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ question-sync-data: Missing meetingId');
      return;
    }

    // Only admin can sync questions
    if (user?.role !== 'admin') {
      console.log(`❌ Non-admin (${user?.role}) tried to sync questions`);
      return;
    }

    if (!questions || !Array.isArray(questions)) {
      console.error('❌ question-sync-data: Invalid questions data');
      return;
    }

    // Store questions for this room
    roomQuestions[meetingId] = questions;

    // Initialize settings if needed
    if (!questionSettings[meetingId]) {
      questionSettings[meetingId] = {
        isVisible: false,
        isFullscreen: false,
        currentQuestionIndex: 0,
      };
    }

    console.log(
      `📚 Admin synced ${questions.length} questions for room ${meetingId}`
    );

    // Confirm sync to admin
    socket.emit('question-sync-confirmed', {
      count: questions.length,
      meetingId: meetingId,
    });

    // If visibility is already ON, broadcast questions to all
    if (questionSettings[meetingId].isVisible) {
      socket.to(meetingId).emit('question-data-sync', {
        questions: questions,
        currentQuestionIndex:
          questionSettings[meetingId].currentQuestionIndex || 0,
      });
      console.log(`📤 Questions auto-broadcasted (visibility was ON)`);
    }
  });

  // ========================================
  // 2️⃣ QUESTION VISIBILITY TOGGLE
  // ========================================
  socket.on('question-visibility', (data) => {
    const { meetingId, isVisible } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ question-visibility: Missing meetingId');
      return;
    }

    // Only admin can toggle visibility
    if (user?.role !== 'admin') {
      console.log(
        `❌ Non-admin (${user?.role}) tried to toggle question visibility`
      );
      return;
    }

    console.log(
      `👁️ Question visibility ${isVisible ? 'ON' : 'OFF'} in room ${meetingId} by ${user?.name}`
    );

    // Initialize room settings if not exists
    if (!questionSettings[meetingId]) {
      questionSettings[meetingId] = {
        isVisible: false,
        isFullscreen: false,
        currentQuestionIndex: 0,
      };
    }

    questionSettings[meetingId].isVisible = isVisible;

    // Broadcast visibility change to ALL users in room
    io.to(meetingId).emit('question-visibility', {
      isVisible: isVisible,
      socketId: socket.id,
      userName: user?.name || 'Admin',
    });

    // If visibility turned ON and we have questions, send them to candidates
    if (isVisible && roomQuestions[meetingId]?.length > 0) {
      // Send questions to all OTHER users (candidates)
      socket.to(meetingId).emit('question-data-sync', {
        questions: roomQuestions[meetingId],
        currentQuestionIndex:
          questionSettings[meetingId].currentQuestionIndex || 0,
      });
      console.log(
        `📤 Questions sent to candidates: ${roomQuestions[meetingId].length} questions`
      );
    }

    // If visibility turned OFF, tell candidates to clear questions
    if (!isVisible) {
      socket.to(meetingId).emit('question-data-sync', {
        questions: [],
        currentQuestionIndex: 0,
        cleared: true,
      });
      console.log(`🗑️ Questions cleared for candidates`);
    }
  });

  // ========================================
  // 3️⃣ QUESTION FULLSCREEN TOGGLE
  // ========================================
  socket.on('question-fullscreen', (data) => {
    const { meetingId, isFullscreen } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ question-fullscreen: Missing meetingId');
      return;
    }

    if (user?.role !== 'admin') {
      console.log(
        `❌ Non-admin (${user?.role}) tried to toggle question fullscreen`
      );
      return;
    }

    console.log(
      `🖥️ Question fullscreen ${isFullscreen ? 'ON' : 'OFF'} in room ${meetingId}`
    );

    if (!questionSettings[meetingId]) {
      questionSettings[meetingId] = {
        isVisible: false,
        isFullscreen: false,
        currentQuestionIndex: 0,
      };
    }

    questionSettings[meetingId].isFullscreen = isFullscreen;

    // Broadcast to ALL users in room
    io.to(meetingId).emit('question-fullscreen', {
      isFullscreen: isFullscreen,
      socketId: socket.id,
      userName: user?.name || 'Admin',
    });
  });

  // ========================================
  // 4️⃣ QUESTION INDEX CHANGE
  // ========================================
  socket.on('question-change', (data) => {
    const { meetingId, questionIndex } = data;
    const user = socket.userData;

    if (!meetingId) {
      console.error('❌ question-change: Missing meetingId');
      return;
    }

    if (user?.role !== 'admin') {
      console.log(`❌ Non-admin (${user?.role}) tried to change question`);
      return;
    }

    console.log(
      `📝 Question changed to index ${questionIndex} in room ${meetingId}`
    );

    if (!questionSettings[meetingId]) {
      questionSettings[meetingId] = {
        isVisible: false,
        isFullscreen: false,
        currentQuestionIndex: 0,
      };
    }

    questionSettings[meetingId].currentQuestionIndex = questionIndex;

    // Broadcast to ALL users in room
    io.to(meetingId).emit('question-change', {
      questionIndex: questionIndex,
      socketId: socket.id,
      userName: user?.name || 'Admin',
    });
  });

  // ========================================
  // 5️⃣ GET CURRENT SETTINGS (for new joiners)
  // ========================================
  socket.on('question-get-settings', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) return;

    const settings = questionSettings[meetingId] || {
      isVisible: false,
      isFullscreen: false,
      currentQuestionIndex: 0,
    };

    console.log(
      `📋 Sending question settings to ${user?.name || socket.id} (${user?.role}):`,
      settings
    );

    // Send settings to requester
    socket.emit('question-settings', {
      isVisible: settings.isVisible === true,
      isFullscreen: settings.isFullscreen === true,
      currentQuestionIndex: settings.currentQuestionIndex || 0,
    });

    // If user is candidate AND visibility is ON AND we have questions, send them
    if (
      user?.role === 'candidate' &&
      settings.isVisible &&
      roomQuestions[meetingId]?.length > 0
    ) {
      socket.emit('question-data-sync', {
        questions: roomQuestions[meetingId],
        currentQuestionIndex: settings.currentQuestionIndex || 0,
      });
      console.log(
        `📤 Sent ${roomQuestions[meetingId].length} questions to joining candidate`
      );
    }
  });

  // ========================================
  // 6️⃣ CANDIDATE REQUESTS QUESTIONS
  // ========================================
  socket.on('question-request-data', (data) => {
    const { meetingId } = data;
    const user = socket.userData;

    if (!meetingId) return;

    const settings = questionSettings[meetingId];

    // Only send if visibility is ON
    if (settings?.isVisible && roomQuestions[meetingId]?.length > 0) {
      socket.emit('question-data-sync', {
        questions: roomQuestions[meetingId],
        currentQuestionIndex: settings.currentQuestionIndex || 0,
      });
      console.log(`📤 Questions sent on request to ${user?.name || socket.id}`);
    } else {
      socket.emit('question-data-sync', {
        questions: [],
        currentQuestionIndex: 0,
        notAvailable: true,
      });
      console.log(`❌ Questions not available for ${user?.name || socket.id}`);
    }
  });
};

// ========================================
// CLEANUP FUNCTION
// ========================================
export const cleanupQuestionRoom = (meetingId) => {
  if (questionSettings[meetingId]) {
    delete questionSettings[meetingId];
  }
  if (roomQuestions[meetingId]) {
    delete roomQuestions[meetingId];
  }
  console.log(`🧹 Question settings & data cleaned for room ${meetingId}`);
};

// ========================================
// DEBUG HELPER
// ========================================
export const getQuestionRoomInfo = (meetingId) => {
  return {
    settings: questionSettings[meetingId] || null,
    questionsCount: roomQuestions[meetingId]?.length || 0,
  };
};

export default setupQuestionHandlers;
