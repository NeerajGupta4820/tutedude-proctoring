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

// ✅ Import Interview Components
import InterviewHeader from '../components/interview/InterviewHeader';
import VideoSection from '../components/interview/VideoSection';
import BottomControls from '../components/interview/BottomControls';
import RightPanel from '../components/interview/RightPanel';
import ToolsBar from '../components/tools/ToolsBar';

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

// ✅ API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

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
  // ✅ FETCH MEETING DATA & CANDIDATE DATA
  // ============================================
  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    // ✅ FETCH FULL CANDIDATE DATA FROM API
    const fetchCandidateData = async (meeting) => {
      setLoadingCandidate(true);
      console.log('🔍 Starting candidate data fetch...');
      console.log('📋 Meeting candidate field:', meeting.candidate);

      try {
        let candidateId = null;
        let candidate = null;

        // Step 1: Extract candidate ID from meeting
        if (meeting.candidate) {
          if (typeof meeting.candidate === 'object' && meeting.candidate._id) {
            candidateId = meeting.candidate._id;
            console.log('📋 Got candidate ID from populated object:', candidateId);
          } else if (typeof meeting.candidate === 'string') {
            candidateId = meeting.candidate;
            console.log('📋 Got candidate ID from string:', candidateId);
          }
        }

        // Step 2: ALWAYS fetch full candidate data from /candidate/:id API
        if (candidateId) {
          console.log('🌐 Fetching full candidate data from API...');
          console.log('🌐 API URL:', `${API_BASE_URL}/candidate/${candidateId}`);

          try {
            const res = await axios.get(
              `${API_BASE_URL}/candidate/${candidateId}`,
              { headers }
            );

            console.log('✅ API Response:', res.data);

            if (res.data.success && res.data.data) {
              candidate = res.data.data;
              console.log('✅ Full candidate data received:', {
                _id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                position: candidate.position,
                experience: candidate.experience,
                photo: candidate.photo ? '✅ Has Photo' : '❌ No Photo',
                resume: candidate.resume ? '✅ Has Resume' : '❌ No Resume',
                status: candidate.status,
                isApproved: candidate.isApproved,
              });
            } else {
              console.log('⚠️ API returned success:false or no data');
            }
          } catch (apiError) {
            console.error('❌ Error fetching candidate from API:', apiError.message);

            // Fallback to populated data if API fails
            if (meeting.candidate && typeof meeting.candidate === 'object') {
              candidate = meeting.candidate;
              console.log('⚠️ Using populated data as fallback');
            }
          }
        } else {
          console.log('⚠️ No candidate ID found in meeting');
        }

        // Step 3: If still no candidate, try from meeting.user
        if (!candidate && meeting.user) {
          console.log('🔍 Trying to get candidate from meeting.user...');
          let userId = null;

          if (typeof meeting.user === 'object' && meeting.user._id) {
            userId = meeting.user._id;
          } else if (typeof meeting.user === 'string') {
            userId = meeting.user;
          }

          if (userId) {
            try {
              const res = await axios.get(
                `${API_BASE_URL}/candidate/${userId}`,
                { headers }
              );
              if (res.data.success && res.data.data) {
                candidate = res.data.data;
                console.log('✅ Candidate fetched from user ID:', candidate.name);
              }
            } catch (err) {
              console.error('❌ Error fetching from user ID:', err.message);
            }
          }
        }

        // Step 4: Final fallback
        if (!candidate) {
          console.log('⚠️ Creating fallback candidate data');
          candidate = {
            _id: meeting.candidate?._id || 'unknown',
            name: meeting.candidate?.name || meeting.candidateName || 'Candidate',
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

        console.log('✅ Final candidate data set:', candidate);
        setCandidateData(candidate);
      } catch (err) {
        console.error('❌ Error in fetchCandidateData:', err);
        setCandidateData(null);
      } finally {
        setLoadingCandidate(false);
      }
    };

    // ✅ FETCH QUESTIONS
    const fetchQuestions = async (meeting) => {
      if (meeting?.assignedQuestions?.length > 0) {
        try {
          const questionIds = meeting.assignedQuestions.map(
            (q) => q.question?._id || q.question || q._id || q
          );
          const res = await axios.get(`${API_BASE_URL}/question/`, {
            params: { ids: questionIds.join(',') },
            headers,
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

    // ✅ DEFAULT QUESTION
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

    // ✅ MAIN FETCH MEETING DATA FUNCTION
    const fetchMeetingData = async () => {
      try {
        console.log('📋 Fetching meeting data for:', meetingId);
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
            console.log('✅ Found meeting by roomId:', meeting?._id);
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
        console.log('✅ Meeting data set:', meeting);

        // ✅ Fetch candidate data if admin
        if (user?.role === 'admin') {
          console.log('👤 User is admin, fetching candidate data...');
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
      console.error('❌ Media error:', err);
      setPermissionError(
        'Camera/mic access denied. Please enable permissions.'
      );
      return null;
    }
  }, []);

  // Initialize media on mount
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
        console.log(
          `🔗 Connection state ${targetSocketId}: ${pc.connectionState}`
        );
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

  const handleOffer = useCallback(
    async ({ offer, from }) => {
      console.log(`📥 Offer from ${from}`);
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
    console.log(`📥 Answer from ${from}`);
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
  // ✅ SOCKET CONNECTION
  // ============================================
  useEffect(() => {
    if (!actualRoomId || !user?.id) {
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

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);

      socket.emit('joinInterview', {
        meetingId: actualRoomId,
        user: { id: user.id, name: user.name, role: user.role },
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log('🔄 Reconnecting... attempt:', attemptNumber);
      setIsReconnecting(true);
    });

    socket.on('participantsUpdate', (list) => {
      console.log('👥 Participants update:', list.length);
      setParticipants(
        list.map((p) => ({
          ...p,
          stream: remoteStreams[p.socketId] || undefined,
        }))
      );
    });

    socket.on('existingParticipants', (existingUsers) => {
      console.log('📢 Existing participants:', existingUsers.length);
      existingUsers.forEach((p) => {
        if (p.id !== user.id && !peerConnections.current[p.socketId]) {
          createPeerConnection(p.socketId, true);
        }
      });
    });

    socket.on('newParticipant', (newUser) => {
      console.log('👤 New participant:', newUser.name);
    });

    socket.on('sendOfferTo', ({ targetSocketId, targetUser }) => {
      console.log('📤 Sending offer to:', targetUser?.name || targetSocketId);
      createPeerConnection(targetSocketId, true);
    });

    socket.on('participantLeft', ({ odlid }) => {
      console.log('👋 Participant left:', odlid);
      cleanupPeerConnection(odlid);
      setParticipants((prev) => prev.filter((p) => p.socketId !== odlid));
    });

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    socket.on('chatMessage', ({ message, from, timestamp }) => {
      setChatMessages((prev) => [
        ...prev,
        { message, from, timestamp, isMe: from === user.name },
      ]);
    });

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
  // ✅ LEAVE MEETING
  // ============================================
  const handleLeave = useCallback(() => {
    console.log('👋 Leaving meeting...');

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
  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;

  // ============================================
  // ✅ RENDER - USING COMPONENTS
  // ============================================
  return (
    <div className="h-screen bg-gray-200 font-sans flex flex-col overflow-hidden">
      {/* ✅ HEADER */}
      <InterviewHeader
        meetingData={meetingData}
        candidateData={candidateData}
        user={user}
        timer={timer}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex overflow-hidden">
            {/* ✅ VIDEO SECTION */}
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

        {/* ✅ RIGHT PANEL */}
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
          chatMessages={chatMessages}
          handleSendMessage={handleSendMessage}
          user={user}
          actualRoomId={actualRoomId}
          socket={socketRef.current}
          candidateData={candidateData}
          loadingCandidate={loadingCandidate}
        />
      </div>
    </div>
  );
};

export default InterviewScreen;