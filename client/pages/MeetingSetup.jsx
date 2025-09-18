import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

const MeetingSetup = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  // Get devices
  useEffect(() => {
    const getDevices = async () => {
      try {
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
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    getDevices();
  }, []);

  // Start or update stream only when camera or mic is explicitly turned on
  useEffect(() => {
    const startStream = async () => {
      if (!selectedCamera || !cameraOn) return; // Only start if camera is on
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: cameraOn && selectedCamera ? { deviceId: { exact: selectedCamera } } : false,
          audio: micOn && selectedMic ? { deviceId: { exact: selectedMic } } : false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error starting stream:", err);
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
      // Turn off camera
      stream.getVideoTracks().forEach((track) => track.stop());
      setCameraOn(false);
      // If mic is also off, stop the entire stream
      if (!micOn) {
        setStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      } else {
        // Keep audio stream if mic is on
        const audioStream = new MediaStream(stream.getAudioTracks());
        setStream(audioStream);
        if (videoRef.current) videoRef.current.srcObject = audioStream;
      }
    } else if (!cameraOn && selectedCamera) {
      // Turn on camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCamera } },
        });
        const newStream = stream
          ? new MediaStream([...stream.getTracks(), ...videoStream.getVideoTracks()])
          : videoStream;
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setCameraOn(true);
      } catch (err) {
        console.error("Error enabling camera:", err);
      }
    }
  };

  const toggleMic = async () => {
    if (stream && micOn) {
      // Turn off mic
      stream.getAudioTracks().forEach((track) => track.stop());
      setMicOn(false);
      // If camera is also off, stop the entire stream
      if (!cameraOn) {
        setStream(null);
        if (videoRef.current) videoRef.current.srcObject = null;
      } else {
        // Keep video stream if camera is on
        const videoStream = new MediaStream(stream.getVideoTracks());
        setStream(videoStream);
        if (videoRef.current) videoRef.current.srcObject = videoStream;
      }
    } else if (!micOn && selectedMic) {
      // Turn on mic
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedMic } },
        });
        const newStream = stream
          ? new MediaStream([...stream.getTracks(), ...audioStream.getAudioTracks()])
          : audioStream;
        setStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setMicOn(true);
      } catch (err) {
        console.error("Error enabling mic:", err);
      }
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
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                Camera is off
              </div>
            )}
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
                <option value="">Select Camera</option>
                {cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={toggleCamera}
              className={`px-4 py-2 rounded ${cameraOn ? 'bg-cyan-700 text-white' : 'bg-gray-300 text-gray-700'}`}
              disabled={!selectedCamera}
            >
              {cameraOn ? 'Off' : 'On'}
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
                <option value="">Select Microphone</option>
                {mics.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Mic ${mic.deviceId}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={toggleMic}
              className={`px-4 py-2 rounded ${micOn ? 'bg-cyan-700 text-white' : 'bg-gray-300 text-gray-700'}`}
              disabled={!selectedMic}
            >
              {micOn ? 'Off' : 'On'}
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
              <option value="">Select Speaker</option>
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
              onClick={() => {
                // Pass meetingId if available in location.state or query
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