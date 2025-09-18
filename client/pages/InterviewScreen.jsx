import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThLarge, FaUserFriends, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaCog, FaSignOutAlt, FaChevronLeft } from 'react-icons/fa';
import { AuthContext } from '../components/AuthContext';
import CodeEditor from '../components/CodeEditor';
import { io } from 'socket.io-client';

const dummyQuestion = {
  title: 'Reverse a String',
  description: 'Write a function that reverses a string.',
  examples: [
    { input: '"hello"', output: '"olleh"', explanation: '' },
    { input: '"world"', output: '"dlrow"', explanation: '' },
  ],
  constraints: ['1 <= s.length <= 1000'],
  starterCode: {
    javascript: `function reverseString(s) {\n  // Your code here\n  return s.split('').reverse().join('');\n}`,
    python: `def reverse_string(s):\n    # Your code here\n    return s[::-1]`,
    cpp: `string reverseString(string s) {\n    // Your code here\n    reverse(s.begin(), s.end());\n    return s;\n}`,
    java: `public String reverseString(String s) {\n    // Your code here\n    return new StringBuilder(s).reverse().toString();\n}`,
  },
};

const InterviewScreen = () => {
  const { user } = useContext(AuthContext);
  const [layout, setLayout] = useState('speaker');
  const [showParticipants, setShowParticipants] = useState(false);
  const location = useLocation();
  const navState = location.state || {};
  const [micOn, setMicOn] = useState(navState.micOn !== undefined ? navState.micOn : false);
  const [camOn, setCamOn] = useState(navState.cameraOn !== undefined ? navState.cameraOn : false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(dummyQuestion.starterCode['javascript']);
  const [mediaStream, setMediaStream] = useState(null);
  const [alert, setAlert] = useState('');
  const [logs, setLogs] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [permissionError, setPermissionError] = useState('');
  const [participants, setParticipants] = useState([]);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const peerConnections = useRef({});

  const searchParams = new URLSearchParams(location.search);
  const meetingId = searchParams.get('meetingId') || navState.meetingId || 'default_meeting';
  if (!searchParams.get('meetingId') && !navState.meetingId) {
    console.warn('No meetingId provided, using fallback:', meetingId);
  }

  // Socket.IO and WebRTC setup
  useEffect(() => {
    console.log('Current user:', user);
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
      console.log(`Emitted joinInterview for meetingId: ${meetingId}, user: ${user.name}`);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });

    socketRef.current.on('participantsUpdate', (list) => {
      console.log('Received participantsUpdate:', list);
      const newParticipants = list.map(u => ({
        id: u.id,
        name: u.name,
        socketId: u.socketId,
        videoRef: React.createRef(),
        stream: undefined,
      }));
      setParticipants(newParticipants);
      console.log('Updated participants state:', newParticipants);

      newParticipants.forEach(p => {
        if (p.id !== user.id && !peerConnections.current[p.socketId]) {
          setupPeerConnection(p.socketId);
        }
      });
    });

    socketRef.current.on('offer', async ({ offer, from }) => {
      console.log('Received offer from:', from);
      if (!peerConnections.current[from]) {
        setupPeerConnection(from);
      }
      const peer = peerConnections.current[from];
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit('answer', { meetingId, answer, to: from });
        console.log('Sent answer to:', from);
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socketRef.current.on('answer', async ({ answer, from }) => {
      console.log('Received answer from:', from);
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
      console.log('Received ICE candidate from:', from);
      const peer = peerConnections.current[from];
      if (peer && candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
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
      console.log(`Received stream from ${socketId}:`, event.streams[0]);
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
        console.log(`Sending ICE candidate to ${socketId}`);
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
        console.log(`Sending offer to ${socketId}`);
        socketRef.current.emit('offer', { meetingId, offer, to: socketId });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    peer.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${socketId}: ${peer.connectionState}`);
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        delete peerConnections.current[socketId];
        peer.close();
      }
    };
  };

  // Media stream setup
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const cameraStatus = await navigator.permissions.query({ name: 'camera' });
        const micStatus = await navigator.permissions.query({ name: 'microphone' });
        if (cameraStatus.state === 'denied' || micStatus.state === 'denied') {
          setPermissionError('Camera/mic access denied. Please enable in browser settings.');
          return false;
        }
        return true;
      } catch (err) {
        console.error('Error checking permissions:', err);
        return false;
      }
    };

    const startStream = async () => {
      if (!camOn && !micOn) {
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
        Object.values(peerConnections.current).forEach(pc => {
          pc.getSenders().forEach(sender => sender.replaceTrack(null));
        });
        return;
      }
      if (!(await checkPermissions())) return;
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
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
        setPermissionError('Camera/mic access denied. Please enable permissions in your browser settings.');
      }
    };

    startStream();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    };
  }, [camOn, micOn]);

  // Toggle camera
  const toggleCamera = async () => {
    if (mediaStream && camOn) {
      mediaStream.getVideoTracks().forEach(track => track.stop());
      setCamOn(false);
      const newStream = micOn ? new MediaStream(mediaStream.getAudioTracks()) : null;
      setMediaStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
      Object.values(peerConnections.current).forEach(pc => {
        pc.getSenders().forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            sender.replaceTrack(null);
          }
        });
      });
    } else if (!camOn) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: micOn,
        });
        if (mediaStream) {
          newStream.getVideoTracks().forEach(track => mediaStream.addTrack(track));
          setMediaStream(mediaStream);
        } else {
          setMediaStream(newStream);
        }
        if (videoRef.current) videoRef.current.srcObject = mediaStream || newStream;
        setCamOn(true);
        setPermissionError('');
        Object.values(peerConnections.current).forEach(pc => {
          newStream.getVideoTracks().forEach(track => pc.addTrack(track, newStream));
        });
      } catch (err) {
        console.error('Error enabling camera:', err);
        setPermissionError('Camera access denied. Please enable permissions in your browser settings.');
      }
    }
  };

  // Toggle mic
  const toggleMic = async () => {
    if (mediaStream && micOn) {
      mediaStream.getAudioTracks().forEach(track => track.stop());
      setMicOn(false);
      const newStream = camOn ? new MediaStream(mediaStream.getVideoTracks()) : null;
      setMediaStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
      Object.values(peerConnections.current).forEach(pc => {
        pc.getSenders().forEach(sender => {
          if (sender.track && sender.track.kind === 'audio') {
            sender.replaceTrack(null);
          }
        });
      });
    } else if (!micOn) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newStream = mediaStream
          ? new MediaStream([...mediaStream.getTracks(), ...audioStream.getAudioTracks()])
          : audioStream;
        setMediaStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setMicOn(true);
        setPermissionError('');
        Object.values(peerConnections.current).forEach(pc => {
          audioStream.getAudioTracks().forEach(track => pc.addTrack(track, audioStream));
        });
      } catch (err) {
        console.error('Error enabling mic:', err);
        setPermissionError('Microphone access denied. Please enable permissions in your browser settings.');
      }
    }
  };

  // Alert effect
  useEffect(() => {
    if (!mediaStream) return;
    const interval = setInterval(() => {
      const alerts = [
        { type: 'Not Focused', color: 'red' },
        { type: 'Phone Detected', color: 'orange' },
        { type: '', color: '' },
      ];
      const idx = Math.floor(Math.random() * alerts.length);
      if (alerts[idx].type) {
        setAlert(alerts[idx].type);
        setLogs((prev) => [
          { time: new Date().toLocaleTimeString(), msg: alerts[idx].type },
          ...prev.slice(0, 9),
        ]);
      } else {
        setAlert('');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [mediaStream]);

  // Recording effect
  useEffect(() => {
    if (mediaStream && !recorder && recording) {
      const mediaRecorder = new window.MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      setRecorder(mediaRecorder);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) setChunks((prev) => [...prev, e.data]);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setChunks([]);
        const formData = new FormData();
        formData.append('video', blob, 'interview.webm');
        try {
          await fetch('/api/upload/video', {
            method: 'POST',
            body: formData,
          });
        } catch (e) {
          console.error('Error uploading video:', e);
        }
      };
      mediaRecorder.start();
    }
    if (recorder && !recording) {
      recorder.stop();
      setRecorder(null);
    }
  }, [recording, mediaStream]);

  // Stop media
  const stopMedia = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
  };

  // Handle leave
  const handleLeave = () => {
    setRecording(false);
    stopMedia();
    navigate('/EndMeeting');
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  // Update code when language changes
  useEffect(() => {
    setCode(dummyQuestion.starterCode[language] || '');
  }, [language]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 relative">
        <div className={`relative flex flex-col bg-white transition-all duration-300 ${editorOpen ? 'md:w-2/5' : 'w-full'}`}>
          <div className="flex-1 flex items-center justify-center relative bg-gray-200">
            <div className="relative w-full h-full grid grid-cols-2 gap-4 p-4">
              {/* Local Video */}
              <div className="relative w-full h-72 rounded-lg overflow-hidden shadow-lg">
                {camOn && !permissionError ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover bg-black"
                      style={{ borderRadius: 12 }}
                    />
                    <canvas
                      ref={overlayRef}
                      width={384}
                      height={288}
                      className="absolute inset-0 pointer-events-none"
                      style={{ borderRadius: 12 }}
                    />
                    <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">
                      {user?.name || 'You'}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center">
                    {permissionError ? (
                      <div className="text-white text-center p-4">
                        <p>{permissionError}</p>
                        <p className="text-sm mt-2">Go to your browser settings to allow camera and mic access.</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center flex-col text-white">
                        <div className="w-16 h-16 bg-cyan-700 rounded-full flex items-center justify-center text-2xl">
                          {getInitials(user?.name)}
                        </div>
                        <span className="mt-2">{user?.name || 'Admin'}</span>
                      </div>
                    )}
                  </div>
                )}
                {alert && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-lg animate-pulse z-20">
                    {alert}
                  </div>
                )}
                <div className="absolute top-2 right-2 z-30">
                  {micOn ? (
                    <FaMicrophone className="text-cyan-700 text-2xl" title="Mic On" />
                  ) : (
                    <FaMicrophoneSlash className="text-red-600 text-2xl" title="Mic Off" />
                  )}
                </div>
              </div>

              {/* Remote Participants */}
              {participants
                .filter(p => p.id !== user.id)
                .map(p => (
                  <div key={p.socketId} className="relative w-full h-72 rounded-lg overflow-hidden shadow-lg">
                    {p.stream ? (
                      <>
                        <video
                          ref={p.videoRef}
                          autoPlay
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover bg-black"
                          style={{ borderRadius: 12 }}
                        />
                        <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">
                          {p.name}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="flex items-center justify-center flex-col text-white">
                          <div className="w-16 h-16 bg-cyan-700 rounded-full flex items-center justify-center text-2xl">
                            {getInitials(p.name)}
                          </div>
                          <span className="mt-2">{p.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Logs */}
            <div className="absolute right-2 top-2 w-56 bg-white/90 rounded shadow p-2 z-10 max-h-60 overflow-y-auto">
              <div className="font-bold text-cyan-700 mb-1">Logs</div>
              <ul className="text-xs text-gray-700 space-y-1">
                {logs.map((log, i) => (
                  <li key={i}>
                    <span className="font-mono text-gray-500">[{log.time}]</span> {log.msg}
                  </li>
                ))}
              </ul>
            </div>

            {/* Record/Stop Button */}
            <button
              className={`absolute bottom-2 left-2 px-4 py-2 rounded text-white font-semibold shadow ${recording ? 'bg-red-600' : 'bg-cyan-700'}`}
              onClick={() => setRecording((r) => !r)}
            >
              {recording ? 'Stop Recording' : 'Start Recording'}
            </button>

            {/* Participants Panel */}
            {showParticipants && (
              <div className="absolute right-0 top-0 h-full w-72 bg-white/95 shadow-lg z-20 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Participants</span>
                  <button onClick={() => setShowParticipants(false)} className="text-gray-500 hover:text-cyan-700 text-xl">&times;</button>
                </div>
                <ul>
                  {participants.map((p, idx) => (
                    <li key={p.socketId || idx} className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-cyan-700 rounded-full flex items-center justify-center text-white">
                        {getInitials(p.name)}
                      </div>
                      <span>{p.name}</span>
                      {p.stream && <span className="text-green-500 text-xs">● Video On</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!editorOpen && (
              <button
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-cyan-700 text-white hover:bg-cyan-800 shadow"
                onClick={() => setEditorOpen(true)}
                title="Open Code Editor"
              >
                <FaChevronLeft className="rotate-180" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 z-10 bg-black px-4 py-2 rounded-t-lg">
            <div className="flex items-center gap-2 flex-wrap justify-center px-4">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full ${micOn ? 'bg-cyan-700 text-white' : 'bg-gray-200 text-gray-500'}`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${camOn ? 'bg-cyan-700 text-white' : 'bg-gray-200 text-gray-500'}`}
                title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {camOn ? <FaVideo /> : <FaVideoSlash />}
              </button>
              <button
                onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
                className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Switch Layout"
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setShowParticipants((v) => !v)}
                className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Show Participants"
              >
                <FaUserFriends />
              </button>
              <button
                className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Settings"
              >
                <FaCog />
              </button>
              <button
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                title="Leave"
                onClick={handleLeave}
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>

        <CodeEditor
          question={dummyQuestion}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          visible={editorOpen}
          onClose={() => setEditorOpen(false)}
          style={{ minWidth: editorOpen ? 0 : 0, maxWidth: editorOpen ? undefined : 0, transition: 'all 0.3s' }}
        />
      </div>
    </div>
  );
};

export default InterviewScreen;