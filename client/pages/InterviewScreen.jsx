// pages/InterviewScreen.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';

import InterviewHeader from '../components/interview/InterviewHeader';
import VideoSection from '../components/interview/VideoSection';
import BottomControls from '../components/interview/BottomControls';
import RightPanel from '../components/interview/RightPanel';
import ToolsBar from '../components/tools/ToolsBar';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

const API_BASE_URL = 'http://localhost:5000/api';

const InterviewScreen = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state || {};

  const searchParams = new URLSearchParams(location.search);
  const meetingId =
    searchParams.get('meetingId') || navState.meetingId || 'default_meeting';

  // UI States
  const [layout, setLayout] = useState('speaker');
  const [showParticipants, setShowParticipants] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [timer, setTimer] = useState('00:00');

  // Whiteboard States (synced via socket)
  const [whiteboardFullscreen, setWhiteboardFullscreen] = useState(false);

  // Question States (synced via socket) - DEFAULT FALSE
  const [questionFullscreen, setQuestionFullscreen] = useState(false);
  const [questionVisibleToCandidate, setQuestionVisibleToCandidate] =
    useState(false);

  // Media States
  const [camOn, setCamOn] = useState(
    navState.cameraOn !== undefined ? navState.cameraOn : false
  );
  const [micOn, setMicOn] = useState(
    navState.micOn !== undefined ? navState.micOn : false
  );
  const [localStream, setLocalStream] = useState(null);
  const [permissionError, setPermissionError] = useState('');

  // Meeting States
  const [meetingData, setMeetingData] = useState(null);
  const [actualRoomId, setActualRoomId] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  // Questions States
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // Connection States
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStates, setConnectionStates] = useState({});

  // Refs
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const remoteVideoRefs = useRef({});

  // NEW: Refs to track sync state (avoids re-renders and infinite loops)
  const questionsSyncedRef = useRef(false);
  const questionsRef = useRef([]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isCandidate = user?.role === 'candidate';

  // Keep questionsRef in sync with questions state
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // ============================================
  // EFFECT: Close question panel for candidate when visibility is turned off
  // ============================================
  useEffect(() => {
    if (isCandidate && !questionVisibleToCandidate) {
      if (activePanel === 'question') {
        console.log('📝 Question hidden from candidate, switching to chat');
        setActivePanel('chat');
      }
    }
  }, [questionVisibleToCandidate, isCandidate, activePanel]);

  // ============================================
  // EFFECT: Admin syncs questions to socket when questions are loaded (ONCE)
  // ============================================
  useEffect(() => {
    if (
      isAdmin &&
      questions.length > 0 &&
      socketRef.current?.connected &&
      actualRoomId &&
      !questionsSyncedRef.current
    ) {
      console.log(
        '📤 Admin syncing questions to socket (initial):',
        questions.length
      );
      socketRef.current.emit('question-sync-data', {
        meetingId: actualRoomId,
        questions: questions,
      });
      questionsSyncedRef.current = true;
    }
  }, [isAdmin, questions, actualRoomId]);

  // ============================================
  // TIMER EFFECT
  // ============================================
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTimer(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // FETCH MEETING DATA & CANDIDATE DATA
  // ============================================
  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    const fetchCandidateData = async (meeting) => {
      setLoadingCandidate(true);
      console.log('🔍 Starting candidate data fetch...');

      try {
        let candidateId = null;
        let candidate = null;

        if (meeting.candidate) {
          if (typeof meeting.candidate === 'object' && meeting.candidate._id) {
            candidateId = meeting.candidate._id;
          } else if (typeof meeting.candidate === 'string') {
            candidateId = meeting.candidate;
          }
        }

        if (candidateId) {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/candidate/${candidateId}`,
              { headers }
            );

            if (res.data.success && res.data.data) {
              candidate = res.data.data;
            }
          } catch (apiError) {
            console.error('Error fetching candidate:', apiError.message);
            if (meeting.candidate && typeof meeting.candidate === 'object') {
              candidate = meeting.candidate;
            }
          }
        }

        if (!candidate) {
          candidate = {
            _id: meeting.candidate?._id || 'unknown',
            name:
              meeting.candidate?.name || meeting.candidateName || 'Candidate',
            email: meeting.candidate?.email || meeting.candidateEmail || 'N/A',
            phone: meeting.candidate?.phone || '',
            position:
              meeting.candidate?.position ||
              meeting.interviewConfig?.jobRole ||
              'Software Engineer',
            photo: null,
            resume: null,
            experience: 'Not specified',
            status: 'pending',
            isApproved: false,
          };
        }

        setCandidateData(candidate);
      } catch (err) {
        console.error('Error in fetchCandidateData:', err);
        setCandidateData(null);
      } finally {
        setLoadingCandidate(false);
      }
    };

    // ============================================
    // FETCH QUESTIONS - ONLY FOR ADMIN
    // ============================================
    const fetchQuestions = async (meeting) => {
      // CANDIDATE WILL GET QUESTIONS VIA SOCKET, NOT API
      if (isCandidate) {
        console.log('👤 Candidate will receive questions via socket');
        setQuestions([]);
        return;
      }

      // ADMIN FETCHES QUESTIONS FROM API
      if (meeting?.assignedQuestions?.length > 0) {
        try {
          const questionIds = meeting.assignedQuestions.map(
            (q) => q.question?._id || q.question || q._id || q
          );
          console.log('📚 Admin fetching questions:', questionIds);

          const res = await axios.get(`${API_BASE_URL}/question/`, {
            params: { ids: questionIds.join(',') },
            headers,
          });

          const fetchedQuestions = res.data.data || [];
          console.log('✅ Admin fetched questions:', fetchedQuestions.length);
          setQuestions(fetchedQuestions);
          questionsSyncedRef.current = false; // Reset to trigger sync
        } catch (err) {
          console.error('Error fetching questions:', err);
          setQuestions([]);
        }
      } else {
        console.log('⚠️ No assigned questions found');
        setQuestions([]);
      }
    };

    const fetchMeetingData = async () => {
      try {
        let meeting = null;
        let roomIdToUse = meetingId;

        if (meetingId.startsWith('meeting-')) {
          roomIdToUse = meetingId;
          try {
            const response = await axios.get(`${API_BASE_URL}/meeting/`, {
              headers,
            });
            const meetings =
              response.data.data?.meetings || response.data.data || [];
            meeting = meetings.find((m) => m.roomId === roomIdToUse);
          } catch (err) {
            console.error('Error fetching meetings:', err);
          }
        } else {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/meeting/${meetingId}`,
              { headers }
            );
            meeting = response.data.data;
            if (meeting?.roomId) {
              roomIdToUse = meeting.roomId;
              const newUrl = new URL(window.location);
              newUrl.searchParams.set('meetingId', roomIdToUse);
              window.history.replaceState({}, '', newUrl);
            }
          } catch (err) {
            console.error('Error fetching meeting:', err);
          }
        }

        if (!meeting) {
          meeting = {
            _id: roomIdToUse,
            roomId: roomIdToUse,
            interviewConfig: { jobRole: 'Technical Interview' },
          };
        }

        setActualRoomId(roomIdToUse);
        setMeetingData(meeting);

        if (isAdmin) {
          await fetchCandidateData(meeting);
        }

        await fetchQuestions(meeting);
      } catch (error) {
        console.error('Error in fetchMeetingData:', error);
        setActualRoomId(meetingId);
        setMeetingData({ _id: meetingId, roomId: meetingId });
      }
    };

    if (meetingId && user) {
      fetchMeetingData();
    }
  }, [meetingId, user, isAdmin, isCandidate]);

  // ============================================
  // MEDIA STREAM MANAGEMENT
  // ============================================
  const getMediaStream = useCallback(async (video, audio) => {
    if (!video && !audio) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
        audio: audio
          ? { echoCancellation: true, noiseSuppression: true }
          : false,
      });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setPermissionError('');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Media error:', err);
      setPermissionError(
        'Camera/mic access denied. Please enable permissions.'
      );
      return null;
    }
  }, []);

  useEffect(() => {
    if (camOn || micOn) {
      getMediaStream(camOn, micOn);
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ============================================
  // WEBRTC PEER CONNECTION
  // ============================================
  const createPeerConnection = useCallback(
    (targetSocketId, isInitiator = false) => {
      if (peerConnections.current[targetSocketId]) {
        peerConnections.current[targetSocketId].close();
        delete peerConnections.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current[targetSocketId] = pc;
      pendingCandidates.current[targetSocketId] = [];

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (stream) {
          setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: stream }));
          setParticipants((prev) =>
            prev.map((p) =>
              p.socketId === targetSocketId ? { ...p, stream } : p
            )
          );
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            meetingId: actualRoomId,
            candidate: event.candidate,
            to: targetSocketId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setConnectionStates((prev) => ({
          ...prev,
          [targetSocketId]: pc.connectionState,
        }));

        if (pc.connectionState === 'failed') {
          pc.restartIce();
        }

        if (pc.connectionState === 'disconnected') {
          setTimeout(() => {
            if (
              peerConnections.current[targetSocketId]?.connectionState ===
              'disconnected'
            ) {
              cleanupPeerConnection(targetSocketId);
            }
          }, 5000);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce();
        }
      };

      if (isInitiator) {
        createAndSendOffer(targetSocketId, pc);
      }

      return pc;
    },
    [actualRoomId]
  );

  const createAndSendOffer = useCallback(
    async (targetSocketId, pc) => {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('offer', {
          meetingId: actualRoomId,
          offer: pc.localDescription,
          to: targetSocketId,
        });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    },
    [actualRoomId]
  );

  const handleOffer = useCallback(
    async ({ offer, from }) => {
      let pc = peerConnections.current[from];
      if (!pc) {
        pc = createPeerConnection(from, false);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        if (pendingCandidates.current[from]?.length > 0) {
          for (const candidate of pendingCandidates.current[from]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.current[from] = [];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit('answer', {
          meetingId: actualRoomId,
          answer: pc.localDescription,
          to: from,
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    },
    [actualRoomId, createPeerConnection]
  );

  const handleAnswer = useCallback(async ({ answer, from }) => {
    const pc = peerConnections.current[from];
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        if (pendingCandidates.current[from]?.length > 0) {
          for (const candidate of pendingCandidates.current[from]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.current[from] = [];
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    const pc = peerConnections.current[from];
    if (pc && pc.remoteDescription?.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    } else {
      if (!pendingCandidates.current[from]) {
        pendingCandidates.current[from] = [];
      }
      pendingCandidates.current[from].push(candidate);
    }
  }, []);

  const cleanupPeerConnection = useCallback((socketId) => {
    const pc = peerConnections.current[socketId];
    if (pc) {
      pc.close();
      delete peerConnections.current[socketId];
    }
    delete pendingCandidates.current[socketId];
    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[socketId];
      return newStreams;
    });
    setConnectionStates((prev) => {
      const newStates = { ...prev };
      delete newStates[socketId];
      return newStates;
    });
  }, []);

  const cleanupAllConnections = useCallback(() => {
    Object.keys(peerConnections.current).forEach((socketId) => {
      cleanupPeerConnection(socketId);
    });
  }, [cleanupPeerConnection]);

  const updateStreamInConnections = useCallback((newStream) => {
    Object.entries(peerConnections.current).forEach(([socketId, pc]) => {
      const senders = pc.getSenders();
      newStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          pc.addTrack(track, newStream);
        }
      });
    });
  }, []);

  // ============================================
  // SOCKET CONNECTION
  // ============================================
  useEffect(() => {
    if (!actualRoomId || !user?.id) {
      return;
    }

    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);

      socket.emit('joinInterview', {
        meetingId: actualRoomId,
        user: { id: user.id, name: user.name, role: user.role },
      });

      // Request current whiteboard settings on connect
      socket.emit('whiteboard-get-settings', { meetingId: actualRoomId });

      // Request current question settings on connect
      socket.emit('question-get-settings', { meetingId: actualRoomId });

      // If admin and questions already loaded, sync them (use ref to avoid dependency)
      if (
        user?.role === 'admin' &&
        questionsRef.current.length > 0 &&
        !questionsSyncedRef.current
      ) {
        console.log('📤 Admin syncing questions after connect');
        socket.emit('question-sync-data', {
          meetingId: actualRoomId,
          questions: questionsRef.current,
        });
        questionsSyncedRef.current = true;
      }

      // If candidate, request questions
      if (user?.role === 'candidate') {
        console.log('👤 Candidate requesting questions');
        socket.emit('question-request-data', { meetingId: actualRoomId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log('🔄 Reconnecting...', attemptNumber);
      setIsReconnecting(true);
    });

    socket.on('participantsUpdate', (list) => {
      setParticipants(
        list.map((p) => ({
          ...p,
          stream: remoteStreams[p.socketId] || undefined,
        }))
      );
    });

    socket.on('existingParticipants', (existingUsers) => {
      existingUsers.forEach((p) => {
        if (p.id !== user.id && !peerConnections.current[p.socketId]) {
          createPeerConnection(p.socketId, true);
        }
      });
    });

    // NEW PARTICIPANT - Don't sync questions here to avoid loop
    socket.on('newParticipant', (newUser) => {
      console.log('New participant joined:', newUser.name);
      // Questions will be sent via question-get-settings when they request
      // No need to emit here - this was causing the infinite loop
    });

    socket.on('sendOfferTo', ({ targetSocketId, targetUser }) => {
      createPeerConnection(targetSocketId, true);
    });

    socket.on('participantLeft', ({ odlid }) => {
      cleanupPeerConnection(odlid);
      setParticipants((prev) => prev.filter((p) => p.socketId !== odlid));
    });

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    // ========================================
    // WHITEBOARD SOCKET EVENTS
    // ========================================
    socket.on('whiteboard-fullscreen', ({ isFullscreen }) => {
      console.log('🖥️ Whiteboard fullscreen received:', isFullscreen);
      setWhiteboardFullscreen(isFullscreen);
    });

    socket.on('whiteboard-settings', ({ isFullscreen, isLocked }) => {
      console.log('📋 Whiteboard settings received:', {
        isFullscreen,
        isLocked,
      });
      if (isFullscreen !== undefined) {
        setWhiteboardFullscreen(isFullscreen);
      }
    });

    // ========================================
    // QUESTION SOCKET EVENTS
    // ========================================
    socket.on('question-visibility', ({ isVisible }) => {
      console.log('👁️ Question visibility received:', isVisible);
      setQuestionVisibleToCandidate(isVisible);

      // If candidate and visibility turned ON, request questions
      if (user?.role === 'candidate' && isVisible) {
        console.log('👤 Candidate requesting questions after visibility ON');
        socket.emit('question-request-data', { meetingId: actualRoomId });
      }
    });

    socket.on('question-fullscreen', ({ isFullscreen }) => {
      console.log('🖥️ Question fullscreen received:', isFullscreen);
      setQuestionFullscreen(isFullscreen);
    });

    socket.on('question-change', ({ questionIndex }) => {
      console.log('📝 Question change received:', questionIndex);
      setCurrentQuestionIndex(questionIndex);
    });

    socket.on(
      'question-settings',
      ({ isVisible, isFullscreen, currentQuestionIndex: qIndex }) => {
        console.log('📋 Question settings received:', {
          isVisible,
          isFullscreen,
          qIndex,
        });
        setQuestionVisibleToCandidate(isVisible === true);
        if (isFullscreen !== undefined) {
          setQuestionFullscreen(isFullscreen);
        }
        if (qIndex !== undefined) {
          setCurrentQuestionIndex(qIndex);
        }
      }
    );

    // ========================================
    // QUESTION DATA SYNC (CANDIDATE RECEIVES QUESTIONS)
    // ========================================
    socket.on(
      'question-data-sync',
      ({
        questions: syncedQuestions,
        currentQuestionIndex: qIndex,
        cleared,
        notAvailable,
      }) => {
        console.log('📥 Question data sync received:', {
          count: syncedQuestions?.length || 0,
          cleared,
          notAvailable,
        });

        // Only update for candidates
        if (user?.role !== 'candidate') {
          return;
        }

        if (cleared || notAvailable) {
          setQuestions([]);
          setCurrentQuestionIndex(0);
          return;
        }

        if (syncedQuestions && syncedQuestions.length > 0) {
          console.log(
            '✅ Candidate received questions:',
            syncedQuestions.length
          );
          setQuestions(syncedQuestions);
          if (qIndex !== undefined) {
            setCurrentQuestionIndex(qIndex);
          }
        }
      }
    );

    // ========================================
    // QUESTION SYNC CONFIRMED (ADMIN ONLY)
    // ========================================
    socket.on('question-sync-confirmed', ({ count, meetingId: roomId }) => {
      console.log(
        `✅ Questions sync confirmed: ${count} questions in room ${roomId}`
      );
    });

    return () => {
      if (socket) {
        socket.emit('leaveInterview', {
          meetingId: actualRoomId,
          userId: user.id,
        });
        socket.disconnect();
      }
      cleanupAllConnections();
    };
  }, [
    actualRoomId,
    user,
    createPeerConnection,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanupPeerConnection,
    cleanupAllConnections,
  ]);

  // ============================================
  // EMIT READY WHEN STREAM IS AVAILABLE
  // ============================================
  useEffect(() => {
    if (
      localStreamRef.current &&
      socketRef.current?.connected &&
      actualRoomId
    ) {
      socketRef.current.emit('readyToConnect', { meetingId: actualRoomId });
    }
  }, [localStream, isConnected, actualRoomId]);

  // ============================================
  // UPDATE VIDEO ELEMENT
  // ============================================
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // ============================================
  // TOGGLE CAMERA
  // ============================================
  const toggleCamera = useCallback(async () => {
    const newState = !camOn;
    setCamOn(newState);

    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newState;
      } else if (newState) {
        const stream = await getMediaStream(true, micOn);
        if (stream) {
          updateStreamInConnections(stream);
        }
      }
    } else if (newState) {
      const stream = await getMediaStream(true, micOn);
      if (stream) {
        updateStreamInConnections(stream);
      }
    }
  }, [camOn, micOn, getMediaStream, updateStreamInConnections]);

  // ============================================
  // TOGGLE MICROPHONE
  // ============================================
  const toggleMic = useCallback(async () => {
    const newState = !micOn;
    setMicOn(newState);

    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newState;
      } else if (newState) {
        const stream = await getMediaStream(camOn, true);
        if (stream) {
          updateStreamInConnections(stream);
        }
      }
    } else if (newState) {
      const stream = await getMediaStream(camOn, true);
      if (stream) {
        updateStreamInConnections(stream);
      }
    }
  }, [camOn, micOn, getMediaStream, updateStreamInConnections]);

  // ============================================
  // RECONNECT HANDLER
  // ============================================
  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true);
    cleanupAllConnections();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }

    setTimeout(() => {
      setIsReconnecting(false);
    }, 3000);
  }, [cleanupAllConnections]);

  // ============================================
  // LEAVE MEETING
  // ============================================
  const handleLeave = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    cleanupAllConnections();

    if (socketRef.current) {
      socketRef.current.emit('leaveInterview', {
        meetingId: actualRoomId,
        userId: user?.id,
      });
      socketRef.current.disconnect();
    }

    if (user?.role === 'admin') {
      navigate(`/admin-end-meeting/${meetingId}`, {
        state: { meeting: meetingData },
      });
    } else {
      navigate('/endmeeting', { state: { meetingId } });
    }
  }, [
    actualRoomId,
    user,
    meetingId,
    meetingData,
    navigate,
    cleanupAllConnections,
  ]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="h-screen bg-gray-200 font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <InterviewHeader
        meetingData={meetingData}
        candidateData={candidateData}
        user={user}
        timer={timer}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex overflow-hidden">
            {/* VIDEO SECTION */}
            <VideoSection
              videoRef={videoRef}
              user={user}
              camOn={camOn}
              micOn={micOn}
              localStream={localStream}
              permissionError={permissionError}
              participants={participants}
              remoteStreams={remoteStreams}
              connectionStates={connectionStates}
              remoteVideoRefs={remoteVideoRefs}
              showParticipants={showParticipants}
              onCloseParticipants={() => setShowParticipants(false)}
              onRetryConnection={(socketId) =>
                createPeerConnection(socketId, true)
              }
            />

            {/* TOOLS BAR */}
            <ToolsBar
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              meetingData={meetingData}
              user={user}
              candidateData={candidateData}
              questionVisibleToCandidate={questionVisibleToCandidate}
            />
          </div>

          {/* BOTTOM CONTROLS */}
          <BottomControls
            micOn={micOn}
            camOn={camOn}
            layout={layout}
            isReconnecting={isReconnecting}
            participantsCount={participants.length}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleLayout={() =>
              setLayout(layout === 'grid' ? 'speaker' : 'grid')
            }
            onToggleParticipants={() => setShowParticipants((v) => !v)}
            onReconnect={handleReconnect}
            onLeave={handleLeave}
          />
        </div>

        {/* RIGHT PANEL */}
        <RightPanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          currentQuestion={currentQuestion}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          meetingId={actualRoomId}
          socket={socketRef.current}
          user={user}
          participants={participants}
          candidateData={candidateData}
          loadingCandidate={loadingCandidate}
          whiteboardFullscreen={whiteboardFullscreen}
          setWhiteboardFullscreen={setWhiteboardFullscreen}
          questionFullscreen={questionFullscreen}
          setQuestionFullscreen={setQuestionFullscreen}
          questionVisibleToCandidate={questionVisibleToCandidate}
          setQuestionVisibleToCandidate={setQuestionVisibleToCandidate}
        />
      </div>
    </div>
  );
};

export default InterviewScreen;
