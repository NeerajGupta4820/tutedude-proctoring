import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaCamera,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaArrowRight,
  FaCheckCircle,
  FaCog,
  FaUser,
} from 'react-icons/fa';

const MeetingSetup = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');

  // Get devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((d) => d.kind === 'videoinput'));
        setMics(devices.filter((d) => d.kind === 'audioinput'));
        setSpeakers(devices.filter((d) => d.kind === 'audiooutput'));
        if (devices.find((d) => d.kind === 'videoinput')) {
          setSelectedCamera(
            devices.find((d) => d.kind === 'videoinput').deviceId
          );
        }
        if (devices.find((d) => d.kind === 'audioinput')) {
          setSelectedMic(devices.find((d) => d.kind === 'audioinput').deviceId);
        }
        if (devices.find((d) => d.kind === 'audiooutput')) {
          setSelectedSpeaker(
            devices.find((d) => d.kind === 'audiooutput').deviceId
          );
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getDevices();
  }, []);

  // Start or update stream only when camera or mic is explicitly turned on
  useEffect(() => {
    const startStream = async () => {
      if (!selectedCamera || !cameraOn) return;
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video:
            cameraOn && selectedCamera
              ? { deviceId: { exact: selectedCamera } }
              : false,
          audio:
            micOn && selectedMic ? { deviceId: { exact: selectedMic } } : false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error starting stream:', err);
      }
    };

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    };
  }, [cameraOn, micOn, selectedCamera, selectedMic]);

  const toggleCamera = async () => {
    if (stream && cameraOn) {
      stream.getVideoTracks().forEach((track) => track.stop());
      setCameraOn(false);
      if (!micOn) {
        setStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      } else {
        const audioStream = new MediaStream(stream.getAudioTracks());
        setStream(audioStream);
        if (videoRef.current) videoRef.current.srcObject = audioStream;
      }
    } else if (!cameraOn && selectedCamera) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCamera } },
        });
        const newStream = stream
          ? new MediaStream([
              ...stream.getTracks(),
              ...videoStream.getVideoTracks(),
            ])
          : videoStream;
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setCameraOn(true);
      } catch (err) {
        console.error('Error enabling camera:', err);
      }
    }
  };

  const toggleMic = async () => {
    if (stream && micOn) {
      stream.getAudioTracks().forEach((track) => track.stop());
      setMicOn(false);
      if (!cameraOn) {
        setStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      } else {
        const videoStream = new MediaStream(stream.getVideoTracks());
        setStream(videoStream);
        if (videoRef.current) videoRef.current.srcObject = videoStream;
      }
    } else if (!micOn && selectedMic) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedMic } },
        });
        const newStream = stream
          ? new MediaStream([
              ...stream.getTracks(),
              ...audioStream.getAudioTracks(),
            ])
          : audioStream;
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setMicOn(true);
      } catch (err) {
        console.error('Error enabling mic:', err);
      }
    }
  };

  const handleJoinMeeting = () => {
    const meetingId = localStorage.getItem('meetingId');
    navigate('/interview' + (meetingId ? `?meetingId=${meetingId}` : ''), {
      state: {
        cameraOn,
        micOn,
        selectedCamera,
        selectedMic,
        meetingId,
      },
    });
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-cyan-700 shadow-lg px-4 py-2 flex-shrink-0">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link
            to="/"
            className="text-xl font-bold text-white flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FaCamera className="text-white text-sm" />
            </div>
            <span className="hidden sm:inline">Interview Proctor</span>
          </Link>
          <div className="flex items-center gap-2 text-white">
            <FaCog className="text-white animate-pulse" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-lg">
              Meeting Setup
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 min-h-0">
        <div className="w-full max-w-4xl h-full max-h-[calc(100vh-120px)] flex gap-4">
          {/* Left Side - Video Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Video Container */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex-1 min-h-0 shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Camera Off Overlay */}
              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-gray-400">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-4xl opacity-50" />
                    </div>
                    <p className="text-lg font-medium">Camera is off</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Turn on camera to see preview
                    </p>
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                    cameraOn
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {cameraOn ? (
                    <FaVideo size={12} />
                  ) : (
                    <FaVideoSlash size={12} />
                  )}
                  {cameraOn ? 'Camera On' : 'Camera Off'}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                    micOn
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {micOn ? (
                    <FaMicrophone size={12} />
                  ) : (
                    <FaMicrophoneSlash size={12} />
                  )}
                  {micOn ? 'Mic On' : 'Mic Off'}
                </div>
              </div>

              {/* Quick Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={toggleCamera}
                      disabled={!selectedCamera}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        cameraOn
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      } ${!selectedCamera ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cameraOn ? (
                        <FaVideo size={18} />
                      ) : (
                        <FaVideoSlash size={18} />
                      )}
                    </button>
                    <button
                      onClick={toggleMic}
                      disabled={!selectedMic}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        micOn
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      } ${!selectedMic ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {micOn ? (
                        <FaMicrophone size={18} />
                      ) : (
                        <FaMicrophoneSlash size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinMeeting}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition shadow-lg text-lg"
            >
              Join Meeting
              <FaArrowRight size={14} />
            </button>
          </div>

          {/* Right Side - Controls Panel */}
          <div className="hidden lg:flex w-72 flex-col gap-3 flex-shrink-0">
            {/* Progress Card */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">Meeting Setup</h3>
                  <p className="text-gray-500 text-sm">Step 3 of 3</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-cyan-600 h-1.5 rounded-full w-full transition-all" />
              </div>
            </div>

            {/* Device Controls Card */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 flex-1 overflow-auto">
              <h4 className="text-gray-800 font-medium mb-4 flex items-center gap-2">
                <FaCog className="text-cyan-600" />
                Device Settings
              </h4>

              {/* Camera Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FaVideo className="text-gray-500" size={14} />
                    <span className="text-sm font-medium text-gray-700">
                      Camera
                    </span>
                  </div>
                  <button
                    onClick={toggleCamera}
                    disabled={!selectedCamera}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      cameraOn
                        ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${!selectedCamera ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cameraOn ? 'On' : 'Off'}
                  </button>
                </div>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select Camera</option>
                  {cameras.map((cam) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Microphone Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FaMicrophone className="text-gray-500" size={14} />
                    <span className="text-sm font-medium text-gray-700">
                      Microphone
                    </span>
                  </div>
                  <button
                    onClick={toggleMic}
                    disabled={!selectedMic}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      micOn
                        ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${!selectedMic ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {micOn ? 'On' : 'Off'}
                  </button>
                </div>
                <select
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select Microphone</option>
                  {mics.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Mic ${mic.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker Selection */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <FaVolumeUp className="text-gray-500" size={14} />
                  <span className="text-sm font-medium text-gray-700">
                    Speaker
                  </span>
                </div>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select Speaker</option>
                  {speakers.map((spk) => (
                    <option key={spk.deviceId} value={spk.deviceId}>
                      {spk.label || `Speaker ${spk.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ready Card */}
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
              <h4 className="text-cyan-800 font-medium mb-2 flex items-center gap-2">
                <FaCheckCircle className="text-cyan-600" />
                Ready to Join
              </h4>
              <p className="text-cyan-700 text-sm">
                Make sure your camera and microphone are working properly before
                joining the meeting. Good luck! 🎉
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyan-700 py-2 flex-shrink-0">
        <p className="text-center text-white text-sm font-medium">
          © {new Date().getFullYear()} The Online Interview Proctor System
        </p>
      </footer>
    </div>
  );
};

export default MeetingSetup;
