import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThLarge, FaUserFriends, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaSignOutAlt, FaClock } from 'react-icons/fa';
import { AuthContext } from '../components/AuthContext';
import CodeEditor from '../components/tools/CodeEditor';
import ToolsBar from '../components/tools/ToolsBar';
import QuestionPanel from '../components/tools/QuestionPanel';
import ChatPanel from '../components/tools/ChatPanel';
import WhiteboardPanel from '../components/tools/WhiteboardPanel';
import { io } from 'socket.io-client';
import axios from 'axios';

const InterviewScreen = () => {
  const { user } = useContext(AuthContext);
  const [layout, setLayout] = useState('speaker');
  const [showParticipants, setShowParticipants] = useState(false);
  const location = useLocation();
  const navState = location.state || {};
  const [micOn, setMicOn] = useState(navState.micOn !== undefined ? navState.micOn : false);
  const [camOn, setCamOn] = useState(navState.cameraOn !== undefined ? navState.cameraOn : false);
  
  // Tools states
  const [activePanel, setActivePanel] = useState(null);
  const [editorUnlockedForUser, setEditorUnlockedForUser] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  // Meeting and Questions
  const [meetingData, setMeetingData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [mediaStream, setMediaStream] = useState(null);
  const [alert, setAlert] = useState('');
  const [logs, setLogs] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [permissionError, setPermissionError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [timer, setTimer] = useState('00:00');
  
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const peerConnections = useRef({});

  const searchParams = new URLSearchParams(location.search);
  const meetingId = searchParams.get('meetingId') || navState.meetingId || 'default_meeting';

  // Timer effect
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch meeting details and questions
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const meeting = response.data.data;
        setMeetingData(meeting);

        if (meeting.assignedQuestions && meeting.assignedQuestions.length > 0) {
          const questionIds = meeting.assignedQuestions.map(q => q.question._id || q.question);
          const questionsResponse = await axios.get('http://localhost:5000/api/questions', {
            params: { ids: questionIds.join(',') },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setQuestions(questionsResponse.data.data || []);
        } else {
          const defaultQuestionResponse = await axios.get('http://localhost:5000/api/questions?limit=1', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setQuestions(defaultQuestionResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        setQuestions([{
          _id: 'dummy-1',
          title: 'Reverse a String',
          description: 'Write a function that reverses a string.',
          problemStatement: 'Given a string s, return the reversed string.',
          examples: [
            { input: '"hello"', output: '"olleh"', explanation: '' },
          ],
          constraints: ['1 <= s.length <= 1000'],
          starterCode: {
            javascript: { code: 'function reverseString(s) {\n  // Your code here\n  return "";\n}' },
            python: { code: 'def reverse_string(s):\n    # Your code here\n    return ""' },
            cpp: { code: 'string reverseString(string s) {\n    // Your code here\n    return "";\n}' },
            java: { code: 'public String reverseString(String s) {\n    // Your code here\n    return "";\n}' },
          },
        }]);
      }
    };

    if (meetingId) {
      fetchMeetingData();
    }
  }, [meetingId]);

  // Update code when question or language changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && currentQuestion.starterCode) {
        setCode(currentQuestion.starterCode[language]?.code || '');
      }
    }
  }, [currentQuestionIndex, language, questions]);

  // Socket.IO and WebRTC setup
  useEffect(() => {
    if (!user || !user.id) {
      console.error('User not authenticated or missing id');
      navigate('/login');
      return;
    }

    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected, socket ID:', socketRef.current.id);
      socketRef.current.emit('joinInterview', {
        meetingId,
        user: { id: user.id, name: user.name, role: user.role },
      });
    });

    socketRef.current.on('participantsUpdate', (list) => {
      const newParticipants = list.map(u => ({
        id: u.id,
        name: u.name,
        socketId: u.socketId,
        videoRef: React.createRef(),
        stream: undefined,
      }));
      setParticipants(newParticipants);

      newParticipants.forEach(p => {
        if (p.id !== user.id && !peerConnections.current[p.socketId]) {
          setupPeerConnection(p.socketId);
        }
      });
    });

    socketRef.current.on('offer', async ({ offer, from }) => {
      if (!peerConnections.current[from]) {
        setupPeerConnection(from);
      }
      const peer = peerConnections.current[from];
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit('answer', { meetingId, answer, to: from });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socketRef.current.on('answer', async ({ answer, from }) => {
      const peer = peerConnections.current[from];
      if (peer) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      }
    });

    socketRef.current.on('ice-candidate', async ({ candidate, from }) => {
      const peer = peerConnections.current[from];
      if (peer && candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    socketRef.current.on('chatMessage', ({ message, from, timestamp }) => {
      setChatMessages(prev => [...prev, { message, from, timestamp, isMe: from === user.name }]);
    });

    return () => {
      if (user && meetingId) {
        socketRef.current.emit('leaveInterview', { meetingId, userId: user.id });
      }
      socketRef.current.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
    };
  }, [user, meetingId, navigate]);

  const setupPeerConnection = (socketId) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnections.current[socketId] = peer;

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));
    }

    peer.ontrack = (event) => {
      setParticipants(prev => {
        return prev.map(p => {
          if (p.socketId === socketId) {
            const stream = event.streams[0];
            if (p.videoRef.current) {
              p.videoRef.current.srcObject = stream;
            }
            return { ...p, stream };
          }
          return p;
        });
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          meetingId,
          candidate: event.candidate,
          to: socketId,
        });
      }
    };

    peer.onnegotiationneeded = async () => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketRef.current.emit('offer', { meetingId, offer, to: socketId });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        delete peerConnections.current[socketId];
        peer.close();
      }
    };
  };

  // Media stream setup
  useEffect(() => {
    const startStream = async () => {
      if (!camOn && !micOn) {
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      try {
        const constraints = { video: camOn ? { width: 1280, height: 720 } : false, audio: micOn };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        Object.values(peerConnections.current).forEach(pc => {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });
        setPermissionError('');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setPermissionError('Camera/mic access denied. Please enable permissions in your browser settings.');
      }
    };

    startStream();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [camOn, micOn]);

  const toggleCamera = () => setCamOn(!camOn);
  const toggleMic = () => setMicOn(!micOn);

  const handleLeave = () => {
    setRecording(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (user.role === 'admin') {
      navigate(`/admin-end-meeting/${meetingId}`, { state: { meeting: meetingData } });
    } else {
      navigate('/endmeeting', { state: { meetingId } });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  const handleSendMessage = (message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('chatMessage', {
        meetingId,
        message,
        from: user.name,
        timestamp: new Date().toISOString(),
      });
      setChatMessages(prev => [...prev, { message, from: user.name, timestamp: new Date().toISOString(), isMe: true }]);
    }
  };

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-gray-200 font-sans flex flex-col">
      {/* Header Bar */}
      <div className="bg-cyan-700 text-white px-6 py-3 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Interview Room</h1>
            {meetingData && (
              <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                {meetingData.interviewConfig?.jobRole || 'Technical Interview'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <FaClock />
              <span className="font-mono font-semibold">{timer}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Video Section */}
        <div className={`relative flex flex-col transition-all duration-300 ${activePanel ? 'w-3/5' : 'w-full'}`}>
          <div className="flex-1 p-6 overflow-auto">
            <div className={`h-full grid ${participants.filter(p => p.id !== user.id).length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
              {/* Local Video Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative w-full h-full min-h-[400px] bg-gray-900 flex flex-col justify-center items-center">
                  {camOn && !permissionError ? (
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
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      {permissionError ? (
                        <div className="text-white text-center p-6 bg-black/30 rounded-lg backdrop-blur-sm max-w-md">
                          <p className="mb-2 font-semibold">⚠️ Permission Required</p>
                          <p className="text-sm">{permissionError}</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center flex-col text-white">
                          <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3">
                            {getInitials(user?.name)}
                          </div>
                          <span className="text-lg font-semibold">{user?.name || 'User'}</span>
                          <span className="text-sm text-gray-400 mt-1">Camera Off</span>
                        </div>
                      )}
                    </div>
                  )}
                  {alert && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold animate-pulse z-20 flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      {alert}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-30 flex gap-2">
                    {micOn ? (
                      <div className="bg-cyan-700 p-2 rounded-full shadow-lg">
                        <FaMicrophone className="text-white text-lg" title="Mic On" />
                      </div>
                    ) : (
                      <div className="bg-red-600 p-2 rounded-full shadow-lg">
                        <FaMicrophoneSlash className="text-white text-lg" title="Mic Off" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Remote Participants Cards */}
              {participants
                .filter(p => p.id !== user.id)
                .map(p => (
                  <div key={p.socketId} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative w-full h-full min-h-[400px] bg-gray-900 flex flex-col justify-center items-center">
                      {p.stream ? (
                        <>
                          <video
                            ref={p.videoRef}
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
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="flex items-center justify-center flex-col text-white">
                            <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3">
                              {getInitials(p.name)}
                            </div>
                            <span className="text-lg font-semibold">{p.name}</span>
                            <span className="text-sm text-gray-400 mt-1">Connecting...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl z-20 animate-slide-in">
              <div className="flex justify-between items-center p-4 bg-cyan-700 text-white">
                <span className="font-bold text-lg flex items-center gap-2">
                  <FaUserFriends />
                  Participants ({participants.length})
                </span>
                <button 
                  onClick={() => setShowParticipants(false)} 
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                {participants.map((p, idx) => (
                  <div key={p.socketId || idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                    <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                      {getInitials(p.name)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{p.name}</div>
                      {p.stream ? (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Video On
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Connecting...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="bg-white border-t border-gray-300 shadow-lg">
            <div className="flex items-center justify-center gap-3 px-6 py-4">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-lg font-semibold transition-all shadow-md hover:scale-105 ${
                  micOn 
                    ? 'bg-cyan-700 text-white hover:bg-cyan-800' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </button>
              
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
              
              <button
                onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
                className="p-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:scale-105"
                title="Switch Layout"
              >
                <FaThLarge size={20} />
              </button>
              
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

              <div className="h-8 w-px bg-gray-300 mx-2"></div>
              
              <button
                className="px-6 py-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md hover:scale-105 flex items-center gap-2"
                title="Leave Interview"
                onClick={handleLeave}
              >
                <FaSignOutAlt size={20} />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tools Bar */}
        <ToolsBar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          meetingData={meetingData}
          user={user} 
        />

        {/* Right Panel - Tools */}
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
            meetingId={meetingId}
            socket={socketRef.current}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewScreen;