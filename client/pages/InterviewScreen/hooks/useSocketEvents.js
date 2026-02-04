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

  // Store user info in ref to avoid re-triggering effect
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    // Basic validation: user and meeting ID must be present
    if (!meetingId || !userRef.current?.id) return;

    // Prevent creating multiple sockets if one already exists
    if (socketInstanceRef.current?.connected) {
      console.log('⚠️ Socket already connected, skipping re-creation');
      return;
    }

    console.log('🔌 Creating new socket connection for meeting:', meetingId);

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

      // Request feature settings
      socket.emit('whiteboard-get-settings', { meetingId: meetingId });
      socket.emit('question-get-settings', { meetingId: meetingId });
      socket.emit('codeeditor-get-settings', { meetingId: meetingId });

      // If we are a candidate, ask for current question data
      if (userRef.current?.role === 'candidate') {
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
    // Note: Signaling events (offer, answer, ice-candidate, newParticipant, etc.)
    // are now handled directly in InterviewScreen.jsx

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
      if (userRef.current?.role === 'candidate' && isVisible) {
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
        if (userRef.current?.role !== 'candidate') return;
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
      console.log('🔌 Cleaning up socket for meeting:', meetingId);
      if (socket) {
        // Tell server we are leaving
        socket.emit('leaveInterview', {
          meetingId: meetingId,
          userId: userRef.current?.id,
        });
        socket.disconnect();
        socketInstanceRef.current = null;
      }
    };
  }, [meetingId]); // Only depend on meetingId, user is accessed via ref

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
    questionsSyncedRef: initialSyncDoneRef,
  };
};
