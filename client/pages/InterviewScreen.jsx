import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaThLarge, FaUserFriends, FaUser, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaCog, FaSignOutAlt, FaChevronLeft } from "react-icons/fa";
import { AuthContext } from "../components/AuthContext"; // Import AuthContext
import CodeEditor from "../components/CodeEditor";

const dummyQuestion = {
  title: "Reverse a String",
  description: "Write a function that reverses a string.",
  examples: [
    { input: '"hello"', output: '"olleh"', explanation: "" },
    { input: '"world"', output: '"dlrow"', explanation: "" },
  ],
  constraints: ["1 <= s.length <= 1000"],
  starterCode: {
    javascript: `function reverseString(s) {\n  // Your code here\n  return s.split('').reverse().join('');\n}`,
    python: `def reverse_string(s):\n    # Your code here\n    return s[::-1]`,
    cpp: `string reverseString(string s) {\n    // Your code here\n    reverse(s.begin(), s.end());\n    return s;\n}`,
    java: `public String reverseString(String s) {\n    // Your code here\n    return new StringBuilder(s).reverse().toString();\n}`,
  },
};

const InterviewScreen = () => {
  const { user } = useContext(AuthContext); // Get user details
  const [layout, setLayout] = useState("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const location = useLocation();
  const navState = location.state || {};
  const [micOn, setMicOn] = useState(navState.micOn !== undefined ? navState.micOn : false);
  const [camOn, setCamOn] = useState(navState.cameraOn !== undefined ? navState.cameraOn : false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(dummyQuestion.starterCode["javascript"]);
  const [mediaStream, setMediaStream] = useState(null);
  const [alert, setAlert] = useState("");
  const [logs, setLogs] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [permissionError, setPermissionError] = useState("");
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  // Dynamic participants including the admin
  const participants = [
    { id: user?._id || "admin", name: user?.name || "Admin", avatar: <FaUser /> },
    { id: 1, name: "Alice", avatar: <FaUser /> },
    { id: 2, name: "Bob", avatar: <FaUser /> },
  ];

  // Block browser back/forward navigation
  useEffect(() => {
    const handlePopState = (e) => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Acquire camera/mic only if enabled
  useEffect(() => {
    const startStream = async () => {
      if (!camOn && !micOn) {
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      try {
        const constraints = {};
        if (camOn) constraints.video = true;
        if (micOn) constraints.audio = true;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermissionError("");
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
        setPermissionError("Camera/mic access denied. Please enable permissions in your browser settings.");
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

  // Toggle camera with flash effect
  const toggleCamera = async () => {
    if (mediaStream && camOn) {
      // Turn off camera
      mediaStream.getVideoTracks().forEach(track => track.stop());
      setCamOn(false);
      if (!micOn) {
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      } else {
        const audioStream = new MediaStream(mediaStream.getAudioTracks());
        setMediaStream(audioStream);
        if (videoRef.current) videoRef.current.srcObject = audioStream;
      }
    } else if (!camOn) {
      try {
        // Flash effect
        const flashStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setTimeout(() => {
          flashStream.getVideoTracks().forEach(track => track.stop());
        }, 500);
        // Start actual stream
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: micOn,
        });
        setMediaStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setCamOn(true);
        setPermissionError("");
      } catch (err) {
        console.error("Error enabling camera:", err);
        setPermissionError("Camera access denied. Please enable permissions in your browser settings.");
      }
    }
  };

  // Toggle mic
  const toggleMic = async () => {
    if (mediaStream && micOn) {
      // Turn off mic
      mediaStream.getAudioTracks().forEach(track => track.stop());
      setMicOn(false);
      if (!camOn) {
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      } else {
        const videoStream = new MediaStream(mediaStream.getVideoTracks());
        setMediaStream(videoStream);
        if (videoRef.current) videoRef.current.srcObject = videoStream;
      }
    } else if (!micOn) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newStream = mediaStream
          ? new MediaStream([...mediaStream.getTracks(), ...audioStream.getAudioTracks()])
          : audioStream;
        setMediaStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setMicOn(true);
        setPermissionError("");
      } catch (err) {
        console.error("Error enabling mic:", err);
        setPermissionError("Microphone access denied. Please enable permissions in your browser settings.");
      }
    }
  };

  // Overlay: Example bounding box and logs (simulate real-time alerts)
  useEffect(() => {
    if (!mediaStream) return;
    const interval = setInterval(() => {
      const alerts = [
        { type: "Not Focused", color: "red" },
        { type: "Phone Detected", color: "orange" },
        { type: "", color: "" },
      ];
      const idx = Math.floor(Math.random() * alerts.length);
      if (alerts[idx].type) {
        setAlert(alerts[idx].type);
        setLogs((prev) => [
          { time: new Date().toLocaleTimeString(), msg: alerts[idx].type },
          ...prev.slice(0, 9),
        ]);
      } else {
        setAlert("");
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [mediaStream]);

  // Start/stop recording
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
        } catch (e) {}
      };
      mediaRecorder.start();
    }
    if (recorder && !recording) {
      recorder.stop();
      setRecorder(null);
    }
  }, [recording, mediaStream]);

  // Stop camera/mic stream on leave
  const stopMedia = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
  };

  // Update code when language changes
  useEffect(() => {
    setCode(dummyQuestion.starterCode[language] || "");
  }, [language]);

  // Editor area width
  const editorWidth = editorOpen ? "flex-1" : "w-0";
  const videoWidth = editorOpen ? "md:w-2/5" : "w-full";

  // Leave call handler
  const handleLeave = () => {
    setRecording(false);
    stopMedia();
    navigate("/EndMeeting");
  };

  // Generate avatar initials
  const getInitials = (name) => {
    if (!name) return "A";
    const words = name.split(" ");
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 relative">
        {/* Video/Participants/Controls */}
        <div className={`relative flex flex-col bg-white transition-all duration-300 ${videoWidth}`}>
          {/* Video Layout */}
          <div className="flex-1 flex items-center justify-center relative bg-gray-200">
            {/* Live Video + Overlay */}
            <div className="relative w-96 h-72 rounded-lg overflow-hidden shadow-lg">
              {camOn && !permissionError ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={!micOn}
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
                      <span className="mt-2">{user?.name || "Admin"}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Real-time alert */}
              {alert && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-lg animate-pulse z-20">
                  {alert}
                </div>
              )}
              {/* Mic status icon (top right) */}
              <div className="absolute top-2 right-2 z-30">
                {micOn ? (
                  <FaMicrophone className="text-cyan-700 text-2xl" title="Mic On" />
                ) : (
                  <FaMicrophoneSlash className="text-red-600 text-2xl" title="Mic Off" />
                )}
              </div>
            </div>

            {/* Logs (right side) */}
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
                  {participants.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{p.avatar}</span>
                      <span>{p.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code Editor Toggle (when closed) */}
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
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full ${micOn ? "bg-cyan-700 text-white" : "bg-gray-200 text-gray-500"}`}
                title={micOn ? "Mute Mic" : "Unmute Mic"}
              >
                {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              {/* Cam Toggle */}
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${camOn ? "bg-cyan-700 text-white" : "bg-gray-200 text-gray-500"}`}
                title={camOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                {camOn ? <FaVideo /> : <FaVideoSlash />}
              </button>
              {/* Layout Switch */}
              <button
                onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")}
                className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Switch Layout"
              >
                <FaThLarge />
              </button>
              {/* Show Participants */}
              <button
                onClick={() => setShowParticipants((v) => !v)}
                className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Show Participants"
              >
                <FaUserFriends />
              </button>
              {/* Settings */}
              <button
                className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Settings"
              >
                <FaCog />
              </button>
              {/* Leave/End Call */}
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

        {/* Code Editor Area */}
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