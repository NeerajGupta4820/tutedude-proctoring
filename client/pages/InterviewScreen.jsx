import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaThLarge,
  FaUserFriends,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaSignOutAlt,
  FaClock,
  FaSync,
  FaWifi,
} from 'react-icons/fa';
import { AuthContext } from '../components/AuthContext';
import CodeEditor from '../components/tools/CodeEditor';
import ToolsBar from '../components/tools/ToolsBar';
import QuestionPanel from '../components/tools/QuestionPanel';
import ChatPanel from '../components/tools/ChatPanel';
import WhiteboardPanel from '../components/tools/WhiteboardPanel';
import CandidateProfilePanel from '../components/tools/CandidateProfilePanel';
import ResumePanel from '../components/tools/ResumePanel';
import { io } from 'socket.io-client';
import axios from 'axios';

// ✅ ICE Server Configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

const InterviewScreen = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state || {};

  // URL params
  const searchParams = new URLSearchParams(location.search);
  const meetingId =
    searchParams.get('meetingId') || navState.meetingId || 'default_meeting';

  // ✅ UI States
  const [layout, setLayout] = useState('speaker');
  const [showParticipants, setShowParticipants] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [timer, setTimer] = useState('00:00');

  // ✅ Media States
  const [camOn, setCamOn] = useState(
    navState.cameraOn !== undefined ? navState.cameraOn : false
  );
  const [micOn, setMicOn] = useState(
    navState.micOn !== undefined ? navState.micOn : false
  );
  const [localStream, setLocalStream] = useState(null);
  const [permissionError, setPermissionError] = useState('');

  // ✅ Meeting States
  const [meetingData, setMeetingData] = useState(null);
  const [actualRoomId, setActualRoomId] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  // ✅ Questions States
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // ✅ Connection States
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStates, setConnectionStates] = useState({});
  const [chatMessages, setChatMessages] = useState([]);

  // ✅ Refs
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const remoteVideoRefs = useRef({});
  const reconnectTimeoutRef = useRef(null);

  // ============================================
  // ✅ TIMER EFFECT
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
  // ✅ FETCH MEETING DATA
  // ============================================
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        console.log('📋 Fetching meeting data for:', meetingId);
        let meeting = null;
        let roomIdToUse = meetingId;

        if (meetingId.startsWith('meeting-')) {
          roomIdToUse = meetingId;
          try {
            const response = await axios.get(
              'http://localhost:5000/api/meeting/',
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            const meetings =
              response.data.data?.meetings || response.data.data || [];
            meeting = meetings.find((m) => m.roomId === roomIdToUse);
          } catch (err) {
            console.error('Error fetching meetings:', err);
          }
        } else {
          try {
            const response = await axios.get(
              `http://localhost:5000/api/meeting/${meetingId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            meeting = response.data.data;
            if (meeting?.roomId) {
              roomIdToUse = meeting.roomId;
              // Update URL
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
        console.log('✅ Meeting data set, roomId:', roomIdToUse);

        // Fetch candidate data if admin
        if (meeting && user?.role === 'admin') {
          await fetchCandidateData(meeting);
        }

        // Fetch questions
        await fetchQuestions(meeting);
      } catch (error) {
        console.error('Error in fetchMeetingData:', error);
        setActualRoomId(meetingId);
        setMeetingData({ _id: meetingId, roomId: meetingId });
      }
    };

    const fetchCandidateData = async (meeting) => {
      setLoadingCandidate(true);
      try {
        let candidate = null;

        if (meeting.candidate) {
          if (typeof meeting.candidate === 'object' && meeting.candidate.name) {
            candidate = meeting.candidate;
          } else {
            const res = await axios.get(
              `http://localhost:5000/api/candidate/${meeting.candidate}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            candidate = res.data.data;
          }
        } else if (meeting.user) {
          if (typeof meeting.user === 'object' && meeting.user.name) {
            candidate = {
              _id: meeting.user._id,
              name: meeting.user.name,
              email: meeting.user.email,
              phone: meeting.user.phone || '',
              position: meeting.interviewConfig?.jobRole || 'Software Engineer',
            };
          }
        }

        if (!candidate) {
          candidate = {
            _id: 'unknown',
            name: 'Candidate',
            email: 'N/A',
            position: meeting.interviewConfig?.jobRole || 'Software Engineer',
          };
        }

        setCandidateData(candidate);
      } catch (err) {
        console.error('Error fetching candidate:', err);
      }
      setLoadingCandidate(false);
    };

    const fetchQuestions = async (meeting) => {
      if (meeting?.assignedQuestions?.length > 0) {
        try {
          const questionIds = meeting.assignedQuestions.map(
            (q) => q.question?._id || q.question || q._id || q
          );
          const res = await axios.get('http://localhost:5000/api/question/', {
            params: { ids: questionIds.join(',') },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setQuestions(res.data.data || []);
        } catch (err) {
          console.error('Error fetching questions:', err);
          loadDefaultQuestion();
        }
      } else {
        loadDefaultQuestion();
      }
    };

    const loadDefaultQuestion = () => {
      setQuestions([
        {
          _id: 'default-1',
          title: 'Two Sum',
          description: 'Find two numbers that add up to target.',
          problemStatement:
            'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          examples: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'nums[0] + nums[1] = 2 + 7 = 9',
            },
          ],
          constraints: ['2 <= nums.length <= 10^4'],
          starterCode: {
            javascript: {
              code: 'function twoSum(nums, target) {\n  // Your code here\n}',
            },
            python: {
              code: 'def two_sum(nums, target):\n    # Your code here\n    pass',
            },
          },
        },
      ]);
    };

    if (meetingId && user) {
      fetchMeetingData();
    }
  }, [meetingId, user]);

  // ============================================
  // ✅ MEDIA STREAM MANAGEMENT
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
      console.log('📹 Getting media stream:', { video, audio });
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

      // Stop old stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setPermissionError('');

      // Update video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('❌ Media error:', err);
      setPermissionError(
        'Camera/mic access denied. Please enable permissions.'
      );
      return null;
    }
  }, []);

  // Initialize media on mount based on initial state
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
  // ✅ WEBRTC PEER CONNECTION
  // ============================================
  const createPeerConnection = useCallback(
    (targetSocketId, isInitiator = false) => {
      console.log(
        `🔌 Creating peer connection for ${targetSocketId}, initiator: ${isInitiator}`
      );

      // Close existing
      if (peerConnections.current[targetSocketId]) {
        peerConnections.current[targetSocketId].close();
        delete peerConnections.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current[targetSocketId] = pc;
      pendingCandidates.current[targetSocketId] = [];

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        console.log(
          `📺 Track received from ${targetSocketId}:`,
          event.track.kind
        );
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

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            meetingId: actualRoomId,
            candidate: event.candidate,
            to: targetSocketId,
          });
        }
      };

      // Connection state
      pc.onconnectionstatechange = () => {
        console.log(
          `🔗 Connection state ${targetSocketId}: ${pc.connectionState}`
        );
        setConnectionStates((prev) => ({
          ...prev,
          [targetSocketId]: pc.connectionState,
        }));

        if (pc.connectionState === 'failed') {
          console.log('🔄 Connection failed, restarting ICE...');
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

      // ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log(`🧊 ICE state ${targetSocketId}: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce();
        }
      };

      // Create offer if initiator
      if (isInitiator) {
        createAndSendOffer(targetSocketId, pc);
      }

      return pc;
    },
    [actualRoomId]
  );

  // Create and send offer
  const createAndSendOffer = useCallback(
    async (targetSocketId, pc) => {
      try {
        console.log(`📤 Creating offer for ${targetSocketId}`);
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

  // Handle incoming offer
  const handleOffer = useCallback(
    async ({ offer, from, fromUser }) => {
      console.log(`📥 Offer from ${from}`);
      let pc = peerConnections.current[from];
      if (!pc) {
        pc = createPeerConnection(from, false);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Add pending ICE candidates
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
        console.log(`📤 Answer sent to ${from}`);
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    },
    [actualRoomId, createPeerConnection]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(async ({ answer, from }) => {
    console.log(`📥 Answer from ${from}`);
    const pc = peerConnections.current[from];
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        // Add pending ICE candidates
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

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    const pc = peerConnections.current[from];
    if (pc && pc.remoteDescription?.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    } else {
      // Buffer candidate
      if (!pendingCandidates.current[from]) {
        pendingCandidates.current[from] = [];
      }
      pendingCandidates.current[from].push(candidate);
    }
  }, []);

  // Cleanup peer connection
  const cleanupPeerConnection = useCallback((socketId) => {
    console.log(`🗑️ Cleaning up peer connection: ${socketId}`);
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

  // Cleanup all connections
  const cleanupAllConnections = useCallback(() => {
    Object.keys(peerConnections.current).forEach((socketId) => {
      cleanupPeerConnection(socketId);
    });
  }, [cleanupPeerConnection]);

  // Update local stream in all connections
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
  // ✅ SOCKET CONNECTION
  // ============================================
  useEffect(() => {
    if (!actualRoomId || !user?.id) {
      console.log('⏳ Waiting for roomId and user...');
      return;
    }

    console.log('🔌 Initializing socket for room:', actualRoomId);

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

    // Socket connected
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);

      // Join room
      socket.emit('joinInterview', {
        meetingId: actualRoomId,
        user: { id: user.id, name: user.name, role: user.role },
      });
    });

    // Socket disconnected
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    // Reconnecting
    socket.on('reconnecting', (attemptNumber) => {
      console.log('🔄 Reconnecting... attempt:', attemptNumber);
      setIsReconnecting(true);
    });

    // Participants update
    socket.on('participantsUpdate', (list) => {
      console.log('👥 Participants update:', list.length);
      setParticipants(
        list.map((p) => ({
          ...p,
          stream: remoteStreams[p.socketId] || undefined,
        }))
      );
    });

    // Existing participants (when joining)
    socket.on('existingParticipants', (existingUsers) => {
      console.log('📢 Existing participants:', existingUsers.length);
      existingUsers.forEach((p) => {
        if (p.id !== user.id && !peerConnections.current[p.socketId]) {
          createPeerConnection(p.socketId, true);
        }
      });
    });

    // New participant joined
    socket.on('newParticipant', (newUser) => {
      console.log('👤 New participant:', newUser.name);
      // Will receive offer from them or send offer
    });

    // Request to send offer
    socket.on('sendOfferTo', ({ targetSocketId, targetUser }) => {
      console.log('📤 Sending offer to:', targetUser?.name || targetSocketId);
      createPeerConnection(targetSocketId, true);
    });

    // Participant left
    socket.on('participantLeft', ({ odlid }) => {
      console.log('👋 Participant left:', odlid);
      cleanupPeerConnection(odlid);
      setParticipants((prev) => prev.filter((p) => p.socketId !== odlid));
    });

    // WebRTC signaling
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    // Chat messages
    socket.on('chatMessage', ({ message, from, timestamp }) => {
      setChatMessages((prev) => [
        ...prev,
        { message, from, timestamp, isMe: from === user.name },
      ]);
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket...');
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
  // ✅ EMIT READY WHEN STREAM IS AVAILABLE
  // ============================================
  useEffect(() => {
    if (
      localStreamRef.current &&
      socketRef.current?.connected &&
      actualRoomId
    ) {
      console.log('📹 Stream ready, emitting readyToConnect');
      socketRef.current.emit('readyToConnect', { meetingId: actualRoomId });
    }
  }, [localStream, isConnected, actualRoomId]);

  // ============================================
  // ✅ UPDATE VIDEO ELEMENT
  // ============================================
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // ============================================
  // ✅ TOGGLE CAMERA
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
  // ✅ TOGGLE MICROPHONE
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
  // ✅ RECONNECT HANDLER
  // ============================================
  const handleReconnect = useCallback(async () => {
    console.log('🔄 Manual reconnect initiated');
    setIsReconnecting(true);

    // Cleanup existing connections
    cleanupAllConnections();

    // Disconnect and reconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }

    // Reset state after a delay
    setTimeout(() => {
      setIsReconnecting(false);
    }, 3000);
  }, [cleanupAllConnections]);

  // ============================================
  // ✅ LEAVE MEETING
  // ============================================
  const handleLeave = useCallback(() => {
    console.log('👋 Leaving meeting...');

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Cleanup connections
    cleanupAllConnections();

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit('leaveInterview', {
        meetingId: actualRoomId,
        userId: user?.id,
      });
      socketRef.current.disconnect();
    }

    // Navigate
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
  // ✅ SEND CHAT MESSAGE
  // ============================================
  const handleSendMessage = useCallback(
    (message) => {
      if (socketRef.current && message.trim() && actualRoomId) {
        const timestamp = new Date().toISOString();
        socketRef.current.emit('chatMessage', {
          meetingId: actualRoomId,
          message,
          from: user.name,
          timestamp,
        });
        setChatMessages((prev) => [
          ...prev,
          { message, from: user.name, timestamp, isMe: true },
        ]);
      }
    },
    [actualRoomId, user]
  );

  // ============================================
  // ✅ HELPER FUNCTIONS
  // ============================================
  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;
  const remoteParticipants = participants.filter((p) => p.id !== user?.id);

  // ============================================
  // ✅ RENDER
  // ============================================
  return (
    <div className="h-screen bg-gray-200 font-sans flex flex-col overflow-hidden">
      {/* ✅ HEADER BAR */}
      <div className="bg-cyan-700 text-white px-6 py-3 shadow-lg flex-shrink-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Interview Room</h1>
            {meetingData && (
              <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                {meetingData.interviewConfig?.jobRole || 'Technical Interview'}
              </span>
            )}
            {candidateData && user?.role === 'admin' && (
              <span className="text-sm bg-white/10 px-3 py-1 rounded-lg">
                Candidate: {candidateData.name}
              </span>
            )}
            {/* Connection Status */}
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                isConnected
                  ? 'bg-green-500'
                  : isReconnecting
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            >
              <FaWifi size={10} />
              <span>
                {isConnected
                  ? 'Connected'
                  : isReconnecting
                    ? 'Reconnecting...'
                    : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <FaClock />
              <span className="font-mono font-semibold">{timer}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="text-xs ml-2 bg-white/20 px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex overflow-hidden">
            {/* ✅ VIDEO SECTION */}
            <div className="flex-1 p-6 overflow-auto">
              <div
                className={`h-full grid ${remoteParticipants.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}
              >
                {/* ✅ LOCAL VIDEO */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative w-full h-full min-h-[400px] bg-gray-900 flex justify-center items-center">
                    {camOn && localStream && !permissionError ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute bottom-3 left-3 bg-cyan-700 text-white px-3 py-1 rounded-lg font-semibold text-sm shadow-lg">
                          {user?.name || 'You'} (Me)
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-white">
                        {permissionError ? (
                          <div className="text-center p-6 bg-black/30 rounded-lg max-w-md">
                            <p className="mb-2 font-semibold">
                              ⚠️ Permission Required
                            </p>
                            <p className="text-sm">{permissionError}</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3">
                              {getInitials(user?.name)}
                            </div>
                            <span className="text-lg font-semibold">
                              {user?.name || 'User'}
                            </span>
                            <span className="text-sm text-gray-400 mt-1">
                              Camera Off
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {/* Mic indicator */}
                    <div className="absolute top-3 right-3 z-30 flex gap-2">
                      {micOn ? (
                        <div className="bg-cyan-700 p-2 rounded-full shadow-lg">
                          <FaMicrophone className="text-white text-lg" />
                        </div>
                      ) : (
                        <div className="bg-red-600 p-2 rounded-full shadow-lg">
                          <FaMicrophoneSlash className="text-white text-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ REMOTE PARTICIPANTS */}
                {remoteParticipants.map((p) => {
                  const remoteStream = remoteStreams[p.socketId];
                  const connState = connectionStates[p.socketId];

                  return (
                    <div
                      key={p.socketId}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="relative w-full h-full min-h-[400px] bg-gray-900 flex justify-center items-center">
                        {remoteStream ? (
                          <>
                            <video
                              ref={(el) => {
                                if (el && el.srcObject !== remoteStream) {
                                  el.srcObject = remoteStream;
                                  remoteVideoRefs.current[p.socketId] = el;
                                }
                              }}
                              autoPlay
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-cyan-700 text-white px-3 py-1 rounded-lg font-semibold text-sm shadow-lg">
                              {p.name}
                            </div>
                            <div className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-1">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Live
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-white">
                            <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3">
                              {getInitials(p.name)}
                            </div>
                            <span className="text-lg font-semibold">
                              {p.name}
                            </span>
                            <span className="text-sm text-gray-400 mt-1">
                              {connState === 'connecting'
                                ? 'Connecting...'
                                : connState === 'connected'
                                  ? 'Waiting for video...'
                                  : connState === 'failed'
                                    ? 'Connection Failed'
                                    : 'Connecting...'}
                            </span>
                            {connState === 'failed' && (
                              <button
                                onClick={() =>
                                  createPeerConnection(p.socketId, true)
                                }
                                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ✅ PARTICIPANTS SIDEBAR */}
              {showParticipants && (
                <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl z-20">
                  <div className="flex justify-between items-center p-4 bg-cyan-700 text-white">
                    <span className="font-bold text-lg flex items-center gap-2">
                      <FaUserFriends />
                      Participants ({participants.length})
                    </span>
                    <button
                      onClick={() => setShowParticipants(false)}
                      className="text-white hover:bg-white/20 rounded-full p-2"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {participants.map((p, idx) => (
                      <div
                        key={p.socketId || idx}
                        className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                          {getInitials(p.name)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {p.name} {p.id === user?.id && '(You)'}
                          </div>
                          <div
                            className={`text-xs flex items-center gap-1 ${
                              remoteStreams[p.socketId] || p.id === user?.id
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                remoteStreams[p.socketId] || p.id === user?.id
                                  ? 'bg-green-500'
                                  : 'bg-gray-400'
                              }`}
                            ></span>
                            {p.id === user?.id
                              ? 'You'
                              : remoteStreams[p.socketId]
                                ? 'Connected'
                                : 'Connecting...'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ TOOLS BAR */}
            <ToolsBar
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              meetingData={meetingData}
              user={user}
              candidateData={candidateData}
            />
          </div>

          {/* ✅ BOTTOM CONTROLS */}
          <div className="bg-white border-t border-gray-300 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-center gap-3 px-6 py-4">
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-lg font-semibold transition-all shadow-md hover:scale-105 ${
                  micOn
                    ? 'bg-cyan-700 text-white hover:bg-cyan-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-lg font-semibold transition-all shadow-md hover:scale-105 ${
                  camOn
                    ? 'bg-cyan-700 text-white hover:bg-cyan-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {camOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
              </button>

              {/* Layout Toggle */}
              <button
                onClick={() =>
                  setLayout(layout === 'grid' ? 'speaker' : 'grid')
                }
                className="p-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:scale-105"
                title="Switch Layout"
              >
                <FaThLarge size={20} />
              </button>

              {/* Participants Toggle */}
              <button
                onClick={() => setShowParticipants((v) => !v)}
                className="p-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:scale-105 relative"
                title="Show Participants"
              >
                <FaUserFriends size={20} />
                {participants.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {participants.length}
                  </span>
                )}
              </button>

              {/* Reconnect Button */}
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className={`p-4 rounded-lg transition-all shadow-md hover:scale-105 ${
                  isReconnecting
                    ? 'bg-yellow-500 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title="Reconnect"
              >
                <FaSync
                  size={20}
                  className={isReconnecting ? 'animate-spin' : ''}
                />
              </button>

              <div className="h-8 w-px bg-gray-300 mx-2"></div>

              {/* Leave Button */}
              <button
                onClick={handleLeave}
                className="px-6 py-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md hover:scale-105 flex items-center gap-2"
                title="Leave Interview"
              >
                <FaSignOutAlt size={20} />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ RIGHT PANEL */}
        {activePanel && (
          <div className="w-[480px] h-full border-l border-gray-300 bg-white flex-shrink-0">
            {activePanel === 'code' && (
              <CodeEditor
                question={currentQuestion}
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                visible={true}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'question' && (
              <QuestionPanel
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'chat' && (
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentUser={user}
                onClose={() => setActivePanel(null)}
              />
            )}

            {activePanel === 'whiteboard' && (
              <WhiteboardPanel
                onClose={() => setActivePanel(null)}
                meetingId={actualRoomId}
                socket={socketRef.current}
              />
            )}

            {activePanel === 'profile' && user?.role === 'admin' && (
              <CandidateProfilePanel
                candidate={candidateData}
                onClose={() => setActivePanel(null)}
                loading={loadingCandidate}
              />
            )}

            {activePanel === 'resume' && (
              <ResumePanel
                candidate={candidateData}
                onClose={() => setActivePanel(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewScreen;
