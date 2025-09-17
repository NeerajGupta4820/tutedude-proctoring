import React, { useEffect, useRef, useState } from "react";
import { useNavigate,Link } from 'react-router-dom';

const MeetingSetup = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  // Get devices
  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
      setSpeakers(devices.filter((d) => d.kind === "audiooutput"));
      if (devices.find((d) => d.kind === "videoinput")) {
        setSelectedCamera(devices.find((d) => d.kind === "videoinput").deviceId);
      }
      if (devices.find((d) => d.kind === "audioinput")) {
        setSelectedMic(devices.find((d) => d.kind === "audioinput").deviceId);
      }
      if (devices.find((d) => d.kind === "audiooutput")) {
        setSelectedSpeaker(devices.find((d) => d.kind === "audiooutput").deviceId);
      }
    };
    getDevices();
  }, []);

  // Start stream
  useEffect(() => {
    const startStream = async () => {
      if (!selectedCamera && !selectedMic) return;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
        audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    };
    startStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCamera, selectedMic]);

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !cameraOn));
      setCameraOn(!cameraOn);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !micOn));
      setMicOn(!micOn);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VIDEO PREVIEW */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h1 className="text-xl font-semibold mb-1">Camera Preview</h1>
          <p className="text-sm text-gray-500">Make sure you look good!</p>
          <div className="mt-4 flex-1 min-h-[400px] rounded-xl overflow-hidden bg-gray-200 border relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Device Controls</h2>

          {/* Camera toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Camera</p>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="border rounded p-1 mt-1"
              >
                {cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={toggleCamera}
              className="px-4 py-2 bg-cyan-500 text-white rounded"
            >
              {cameraOn ? "Turn Off" : "Turn On"}
            </button>
          </div>

          {/* Mic toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Microphone</p>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="border rounded p-1 mt-1"
              >
                {mics.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Mic ${mic.deviceId}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={toggleMic}
              className="px-4 py-2 bg-cyan-500 text-white rounded"
            >
              {micOn ? "Mute" : "Unmute"}
            </button>
          </div>

          {/* Speaker selection */}
          <div className="mb-4">
            <p className="font-medium">Speaker</p>
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="border rounded p-1 mt-1 w-full"
            >
              {speakers.map((spk) => (
                <option key={spk.deviceId} value={spk.deviceId}>
                  {spk.label || `Speaker ${spk.deviceId}`}
                </option>
              ))}
            </select>
          </div>

            <div className="space-y-3 mt-10">
                <button
                  className="bg-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-cyan-700 border-2 border-cyan-700 transition"
                  size="lg"
                  onClick={() => {
                    navigate('/interview');
                  }}
                >
                  Join Meeting
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  Do not worry, our team is super friendly! We want you to succeed. 🎉
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
