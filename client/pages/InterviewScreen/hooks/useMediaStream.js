import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useMediaStream Hook
 * This hook manages the user's local camera and microphone.
 */
export const useMediaStream = (navState) => {
  // --- States ---

  // Camera status (ON/OFF) - initialized from navigation or saved session
  const [isCameraEnabled, setIsCameraEnabled] = useState(() => {
    if (navState.cameraOn !== undefined) return navState.cameraOn;
    const saved = sessionStorage.getItem('camOn');
    return saved ? JSON.parse(saved) : false;
  });

  // Microphone status (ON/OFF)
  const [isMicEnabled, setIsMicEnabled] = useState(() => {
    if (navState.micOn !== undefined) return navState.micOn;
    const saved = sessionStorage.getItem('micOn');
    return saved ? JSON.parse(saved) : false;
  });

  // The actual media stream object containing the video/audio tracks
  const [activeLocalStream, setActiveLocalStream] = useState(null);

  // Error message if the user denies camera/mic access
  const [accessError, setAccessError] = useState('');

  // Refs for tracking internal state without re-rendering
  const mediaStreamRef = useRef(null);
  const localVideoPreviewRef = useRef(null);

  /**
   * Main function to request camera/mic access from the browser.
   */
  const fetchUserMedia = useCallback(async (videoDesired, audioDesired) => {
    // If user wants nothing, stop current tracks and clear up
    if (!videoDesired && !audioDesired) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setActiveLocalStream(null);
      }
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDesired
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
        audio: audioDesired
          ? { echoCancellation: true, noiseSuppression: true }
          : false,
      });

      // Stop any orphan tracks before switching to the new stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      mediaStreamRef.current = stream;
      setActiveLocalStream(stream);
      setAccessError('');

      // Show preview in the local video element if it exists
      if (localVideoPreviewRef.current) {
        localVideoPreviewRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Media access error:', err);
      setAccessError(
        'Permission denied. Please allow camera and microphone access in your browser.'
      );
      return null;
    }
  }, []);

  /**
   * Turns the camera ON or OFF.
   */
  const toggleCameraAction = useCallback(async () => {
    const nextState = !isCameraEnabled;
    setIsCameraEnabled(nextState);
    sessionStorage.setItem('camOn', JSON.stringify(nextState));

    if (nextState) {
      // If turning ON, request a new stream with current mic setting
      await fetchUserMedia(true, isMicEnabled);
    } else {
      // If turning OFF, stop the video track
      if (mediaStreamRef.current) {
        const videoTracks = mediaStreamRef.current.getVideoTracks();
        videoTracks.forEach((track) => track.stop());

        // If mic is still on, we need an audio-only stream
        if (isMicEnabled) {
          await fetchUserMedia(false, true);
        } else {
          // Everything is off now
          mediaStreamRef.current = null;
          setActiveLocalStream(null);
        }
      }
    }
  }, [isCameraEnabled, isMicEnabled, fetchUserMedia]);

  /**
   * Turns the microphone ON or OFF.
   */
  const toggleMicAction = useCallback(async () => {
    const nextState = !isMicEnabled;
    setIsMicEnabled(nextState);
    sessionStorage.setItem('micOn', JSON.stringify(nextState));

    if (nextState) {
      // If turning ON, request a new stream with current camera setting
      await fetchUserMedia(isCameraEnabled, true);
    } else {
      // If turning OFF, stop the audio track
      if (mediaStreamRef.current) {
        const audioTracks = mediaStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => track.stop());

        // If camera is still on, we need a video-only stream
        if (isCameraEnabled) {
          await fetchUserMedia(true, false);
        } else {
          // Everything is off now
          mediaStreamRef.current = null;
          setActiveLocalStream(null);
        }
      }
    }
  }, [isCameraEnabled, isMicEnabled, fetchUserMedia]);

  /**
   * Initial Setup: When the hook first loads, start the camera/mic if they are enabled.
   */
  useEffect(() => {
    if (isCameraEnabled || isMicEnabled) {
      fetchUserMedia(isCameraEnabled, isMicEnabled);
    }

    // Cleanup: Stop all tracks when the user leaves the page
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Watch for stream changes and keep the video preview element in sync
  useEffect(() => {
    if (localVideoPreviewRef.current && activeLocalStream) {
      localVideoPreviewRef.current.srcObject = activeLocalStream;
    }
  }, [activeLocalStream]);

  // Public items used by the UI components
  return {
    camOn: isCameraEnabled,
    micOn: isMicEnabled,
    localStream: activeLocalStream,
    permissionError: accessError,
    videoRef: localVideoPreviewRef,
    localStreamRef: mediaStreamRef,
    toggleCamera: toggleCameraAction,
    toggleMic: toggleMicAction,
    getMediaStream: fetchUserMedia,
  };
};
