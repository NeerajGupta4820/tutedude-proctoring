// hooks/useMediaStream.js
import { useRef, useState, useCallback, useEffect } from 'react';

export const useMediaStream = (initialCamOn = false, initialMicOn = false) => {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [camOn, setCamOn] = useState(initialCamOn);
  const [micOn, setMicOn] = useState(initialMicOn);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Get media stream
  const getStream = useCallback(async (video = true, audio = true) => {
    if (!video && !audio) {
      stopStream();
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constraints = {
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      };

      console.log('📹 Getting media with constraints:', constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Stop old stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = newStream;
      setStream(newStream);
      setIsLoading(false);

      return newStream;
    } catch (err) {
      console.error('❌ Media error:', err);
      setError(err.message || 'Failed to access camera/microphone');
      setIsLoading(false);
      return null;
    }
  }, []);

  // ✅ Stop stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // ✅ Toggle camera
  const toggleCamera = useCallback(async () => {
    const newCamState = !camOn;
    setCamOn(newCamState);

    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newCamState;
      } else if (newCamState) {
        // Need to get new stream with video
        await getStream(true, micOn);
      }
    } else if (newCamState || micOn) {
      await getStream(newCamState, micOn);
    }

    return newCamState;
  }, [camOn, micOn, getStream]);

  // ✅ Toggle microphone
  const toggleMic = useCallback(async () => {
    const newMicState = !micOn;
    setMicOn(newMicState);

    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newMicState;
      } else if (newMicState) {
        await getStream(camOn, true);
      }
    } else if (camOn || newMicState) {
      await getStream(camOn, newMicState);
    }

    return newMicState;
  }, [camOn, micOn, getStream]);

  // ✅ Replace track (for switching cameras)
  const replaceTrack = useCallback(async (kind, constraints) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia(
        kind === 'video' ? { video: constraints } : { audio: constraints }
      );

      const newTrack = newStream.getTracks()[0];

      if (streamRef.current) {
        const oldTrack = streamRef.current
          .getTracks()
          .find((t) => t.kind === kind);
        if (oldTrack) {
          oldTrack.stop();
          streamRef.current.removeTrack(oldTrack);
        }
        streamRef.current.addTrack(newTrack);
      }

      return newTrack;
    } catch (err) {
      console.error('Error replacing track:', err);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Initialize stream based on initial state
  useEffect(() => {
    if (initialCamOn || initialMicOn) {
      getStream(initialCamOn, initialMicOn);
    }
  }, []);

  return {
    stream,
    streamRef,
    camOn,
    micOn,
    error,
    isLoading,
    getStream,
    stopStream,
    toggleCamera,
    toggleMic,
    replaceTrack,
    setCamOn,
    setMicOn,
  };
};

export default useMediaStream;
