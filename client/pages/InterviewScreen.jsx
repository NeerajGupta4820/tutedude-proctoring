import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaThLarge, FaUserFriends, FaUser, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaCog, FaSignOutAlt, FaChevronLeft } from "react-icons/fa";
import CodeEditor from "../components/CodeEditor";

const participants = [
  { id: 1, name: "Alice", avatar: <FaUser /> },
  { id: 2, name: "Bob", avatar: <FaUser /> },
];

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
  const [layout, setLayout] = useState("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const location = useLocation();
  // Get camera/mic state from MeetingSetup
  const navState = location.state || {};
  const [micOn, setMicOn] = useState(navState.micOn !== undefined ? navState.micOn : true);
  const [camOn, setCamOn] = useState(navState.cameraOn !== undefined ? navState.cameraOn : true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(dummyQuestion.starterCode["javascript"]);
  const [mediaStream, setMediaStream] = useState(null);
  const [alert, setAlert] = useState("");
  const [logs, setLogs] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  // Block browser back/forward navigation
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (!mediaStream) {
      const constraints = {};
      if (camOn) constraints.video = true;
      if (micOn) constraints.audio = true;
      if (!camOn && !micOn) {
        setMediaStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setMediaStream(null);
          if (videoRef.current) videoRef.current.srcObject = null;
        });
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    }
    // eslint-disable-next-line
  }, [mediaStream, camOn, micOn]);

  // Toggle camera on/off
  React.useEffect(() => {
    if (!mediaStream) return;
    mediaStream.getVideoTracks().forEach(track => {
      track.enabled = camOn;
    });
  }, [camOn, mediaStream]);

  // Toggle mic on/off
  React.useEffect(() => {
    if (!mediaStream) return;
    mediaStream.getAudioTracks().forEach(track => {
      track.enabled = micOn;
    });
  }, [micOn, mediaStream]);

  // Overlay: Example bounding box and logs (simulate real-time alerts)
  React.useEffect(() => {
    if (!mediaStream) return;
    // Simulate alerts every 10s
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
  React.useEffect(() => {
    if (mediaStream && !recorder && recording) {
      const mediaRecorder = new window.MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      setRecorder(mediaRecorder);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) setChunks((prev) => [...prev, e.data]);
      };
      mediaRecorder.onstop = async () => {
        // Send video to backend
        const blob = new Blob(chunks, { type: 'video/webm' });
        setChunks([]);
        // Example: send to backend
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
    // eslint-disable-next-line
  }, [recording, mediaStream]);


  // Stop camera/mic stream on leave
  const stopMedia = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
  };

  // Update code when language changes
  React.useEffect(() => {
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


  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 relative">
        {/* Video/Participants/Controls */}
        <div className={`relative flex flex-col bg-white -r transition-all duration-300 ${videoWidth}`}> 
          {/* Video Layout */}
          <div className="flex-1 flex items-center justify-center relative bg-gray-200">
            {/* Live Video + Overlay */}
            <div className="relative w-96 h-72 rounded-lg overflow-hidden shadow-lg">
              {camOn ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={!micOn}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                    style={{ borderRadius: 12 }}
                  />
                  {/* Overlay: bounding box (example) */}
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
                  <span className="text-white text-4xl font-bold">Camera Off</span>
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
                onClick={() => setMicOn((v) => !v)}
                className={`p-3 rounded-full  ${micOn ? "bg-cyan-700 text-white" : "bg-gray-200 text-gray-500"}`}
                title={micOn ? "Mute Mic" : "Unmute Mic"}
              >
                {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              {/* Cam Toggle */}
              <button
                onClick={() => setCamOn((v) => !v)}
                className={`p-3 rounded-full  ${camOn ? "bg-cyan-700 text-white" : "bg-gray-200 text-gray-500"}`}
                title={camOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                {camOn ? <FaVideo /> : <FaVideoSlash />}
              </button>
              {/* Layout Switch */}
              <button
                onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")}
                className="p-3 rounded-full  bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Switch Layout"
              >
                <FaThLarge />
              </button>
              {/* Show Participants */}
              <button
                onClick={() => setShowParticipants((v) => !v)}
                className="p-3 rounded-full  bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Show Participants"
              >
                <FaUserFriends />
              </button>
              {/* Settings */}
              <button
                className="p-3 rounded-full  bg-gray-200 text-gray-700 hover:bg-cyan-100"
                title="Settings"
              >
                <FaCog />
              </button>
              {/* Leave/End Call */}
              <button
                className="p-3 rounded-full  bg-red-600 text-white hover:bg-red-700"
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
