import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

/**
 * useSocketEvents Hook
 * This hook manages the Real-Time communication via Socket.io.
 * It handles events like Chat, Whiteboard, and Question syncing.
 */
export const useSocketEvents = (meetingId, user) => {
  // --- States ---
  const socketInstanceRef = useRef(null);
  const [isSuccessfullyConnected, setIsSuccessfullyConnected] = useState(false);
  const [isCurrentlyReconnecting, setIsCurrentlyReconnecting] = useState(false);

  // Feature States (Synced across users)
  const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);
  const [isQuestionFullscreen, setIsQuestionFullscreen] = useState(false);
  const [showQuestionToCandidate, setShowQuestionToCandidate] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [meetingQuestions, setMeetingQuestions] = useState([]);

  // Code Editor Feature States
  const [isCodeEditorFullscreen, setIsCodeEditorFullscreen] = useState(false);
  const [showCodeEditorToCandidate, setShowCodeEditorToCandidate] =
    useState(false);

  // Logic Refs
  const initialSyncDoneRef = useRef(false);

  useEffect(() => {
    // Basic validation: user and meeting ID must be present
    if (!meetingId || !user?.id) return;

    // Initialize the Socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    });

    socketInstanceRef.current = socket;

    // --- Core Lifecycle Listeners ---

    socket.on('connect', () => {
      console.log('✅ Socket.io connected. ID:', socket.id);
      setIsSuccessfullyConnected(true);
      setIsCurrentlyReconnecting(false);

      // Join the interview room and tell the server who we are
      socket.emit('joinInterview', {
        meetingId: meetingId,
        user: { id: user.id, name: user.name, role: user.role },
      });

      // Request latest settings from the server (in case we re-joined)
      socket.emit('whiteboard-get-settings', { meetingId: meetingId });
      socket.emit('question-get-settings', { meetingId: meetingId });
      socket.emit('codeeditor-get-settings', { meetingId: meetingId });

      // If we are a candidate, ask for current question data
      if (user?.role === 'candidate') {
        socket.emit('question-request-data', { meetingId: meetingId });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
      setIsSuccessfullyConnected(false);
    });

    socket.on('reconnecting', () => {
      console.log('🔄 Socket.io attempting to reconnect...');
      setIsCurrentlyReconnecting(true);
    });

    // --- Feature Specific Listeners ---

    // 1. Whiteboard Events
    socket.on('whiteboard-fullscreen', ({ isFullscreen }) =>
      setIsWhiteboardFullscreen(isFullscreen)
    );
    socket.on('whiteboard-settings', ({ isFullscreen }) => {
      if (isFullscreen !== undefined) setIsWhiteboardFullscreen(isFullscreen);
    });

    // 2. Question Panel Events
    socket.on('question-visibility', ({ isVisible }) => {
      setShowQuestionToCandidate(isVisible);
      if (user?.role === 'candidate' && isVisible) {
        socket.emit('question-request-data', { meetingId: meetingId });
      }
    });

    socket.on('question-fullscreen', ({ isFullscreen }) =>
      setIsQuestionFullscreen(isFullscreen)
    );
    socket.on('question-change', ({ questionIndex }) =>
      setActiveQuestionIndex(questionIndex)
    );

    // Catch-up event for general settings
    socket.on(
      'question-settings',
      ({ isVisible, isFullscreen, currentQuestionIndex: qIndex }) => {
        setShowQuestionToCandidate(isVisible === true);
        if (isFullscreen !== undefined) setIsQuestionFullscreen(isFullscreen);
        if (qIndex !== undefined) setActiveQuestionIndex(qIndex);
      }
    );

    // Actual question data sync for candidates
    socket.on(
      'question-data-sync',
      ({
        questions: syncedQuestions,
        currentQuestionIndex: qIndex,
        cleared,
        notAvailable,
      }) => {
        if (user?.role !== 'candidate') return;
        if (cleared || notAvailable) {
          setMeetingQuestions([]);
          setActiveQuestionIndex(0);
          return;
        }
        if (syncedQuestions && syncedQuestions.length > 0) {
          setMeetingQuestions(syncedQuestions);
          if (qIndex !== undefined) setActiveQuestionIndex(qIndex);
        }
      }
    );

    // 3. Code Editor Events
    socket.on('codeeditor-visibility', ({ isVisible }) =>
      setShowCodeEditorToCandidate(isVisible)
    );
    socket.on('codeeditor-fullscreen', ({ isFullscreen }) =>
      setIsCodeEditorFullscreen(isFullscreen)
    );
    socket.on('codeeditor-settings', ({ isVisible, isFullscreen }) => {
      if (isVisible !== undefined) setShowCodeEditorToCandidate(isVisible);
      if (isFullscreen !== undefined) setIsCodeEditorFullscreen(isFullscreen);
    });

    // --- Cleanup ---
    return () => {
      if (socket) {
        // Tell server we are leaving
        socket.emit('leaveInterview', {
          meetingId: meetingId,
          userId: user.id,
        });
        socket.disconnect();
      }
    };
  }, [meetingId, user]);

  // Exposed items for the main InterviewScreen component
  return {
    socket: socketInstanceRef.current,
    isConnected: isSuccessfullyConnected,
    isReconnecting: isCurrentlyReconnecting,
    whiteboardFullscreen: isWhiteboardFullscreen,
    setWhiteboardFullscreen: setIsWhiteboardFullscreen,
    questionFullscreen: isQuestionFullscreen,
    questionVisibleToCandidate: showQuestionToCandidate,
    currentQuestionIndex: activeQuestionIndex,
    setCurrentQuestionIndex: setActiveQuestionIndex,
    questions: meetingQuestions,
    setQuestions: setMeetingQuestions,
    codeEditorFullscreen: isCodeEditorFullscreen,
    codeEditorVisibleToCandidate: showCodeEditorToCandidate,
    questionsSyncedRef: initialSyncDoneRef, // Used to track if we need to send initial sync from admin
  };
};
