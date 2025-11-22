import { useState, useEffect, useRef } from 'react';

const useMediaStream = () => {
  const [mediaStream, setMediaStream] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const videoRef = useRef(null);

  const toggleMic = async () => {
    if (micOn && mediaStream) {
      mediaStream.getAudioTracks().forEach(track => track.stop());
      setMicOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(prev => {
          if (prev) {
            stream.getAudioTracks().forEach(track => prev.addTrack(track));
            return prev;
          }
          return stream;
        });
        setMicOn(true);
        setPermissionError('');
      } catch (err) {
        setPermissionError('Microphone access denied');
      }
    }
  };

  const toggleCamera = async () => {
    if (camOn && mediaStream) {
      mediaStream.getVideoTracks().forEach(track => track.stop());
      setCamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        setMediaStream(prev => {
          if (prev) {
            stream.getVideoTracks().forEach(track => prev.addTrack(track));
            return prev;
          }
          return stream;
        });
        setCamOn(true);
        setPermissionError('');
      } catch (err) {
        setPermissionError('Camera access denied');
      }
    }
  };

  return {
    mediaStream,
    micOn,
    camOn,
    toggleMic,
    toggleCamera,
    permissionError,
  };
};

export default useMediaStream;