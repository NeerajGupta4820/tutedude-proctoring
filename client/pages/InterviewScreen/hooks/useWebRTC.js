import { useRef, useCallback, useEffect, useState } from 'react';
import { ICE_SERVERS } from '../constants';

/**
 * useWebRTC Hook
 * This hook handles the actual video/audio connection between users.
 * It uses the "Perfect Negotiation" pattern to avoid connection conflicts.
 */
export const useWebRTC = (socket, roomId, isConnected, localStream) => {
  // Store all active peer connections: { [remoteSocketId]: RTCPeerConnection }
  const activeConnections = useRef({});

  // States to keep track of streams and connection statuses for UI
  const [receivedStreams, setReceivedStreams] = useState({});
  const [connectionStates, setConnectionStates] = useState({});
  const [participants, setParticipants] = useState([]);

  // Negotiation state to prevent "Glare" (when both try to call at the same time)
  // { [remoteSocketId]: { makingOffer: bool, ignoreOffer: bool, polite: bool } }
  const negotiationStatus = useRef({});

  // Refs to keep the latest values without causing unnecessary re-renders
  const socketRef = useRef(socket);
  const roomIdRef = useRef(roomId);
  const localStreamRef = useRef(localStream);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  /**
   * Prepares the negotiation logic for a specific peer.
   * "Polite" means this user will back down if both users send an offer at once.
   */
  const ensureNegotiationSettings = (remoteId) => {
    if (!negotiationStatus.current[remoteId]) {
      negotiationStatus.current[remoteId] = {
        makingOffer: false,
        ignoreOffer: false,
        polite: false,
      };
    }
    return negotiationStatus.current[remoteId];
  };

  // --- 1. Cleanup Logic ---

  /**
   * Closes and removes a connection for a specific user.
   */
  const removePeerConnection = useCallback((remoteId) => {
    const pc = activeConnections.current[remoteId];
    if (pc) {
      // Remove all event listeners before closing
      pc.onnegotiationneeded = null;
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      delete activeConnections.current[remoteId];
    }
    delete negotiationStatus.current[remoteId];

    // Update UI states to remove this user's data
    setReceivedStreams((prev) => {
      const updated = { ...prev };
      delete updated[remoteId];
      return updated;
    });
    setConnectionStates((prev) => {
      const updated = { ...prev };
      delete updated[remoteId];
      return updated;
    });
    setParticipants((prev) => prev.filter((p) => p.socketId !== remoteId));
  }, []);

  /**
   * Closes all active connections (useful when leaving the room).
   */
  const removeAllConnections = useCallback(() => {
    Object.keys(activeConnections.current).forEach((id) =>
      removePeerConnection(id)
    );
  }, [removePeerConnection]);

  // --- 2. Connection Initialization ---

  /**
   * Creates a new WebRTC connection for a remote user.
   */
  const initializeNewConnection = useCallback((remoteId) => {
    if (activeConnections.current[remoteId]) {
      console.log('♻️ Connection already exists for:', remoteId);
      return activeConnections.current[remoteId];
    }

    console.log(`🔗 Creating new connection for: ${remoteId}`);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    activeConnections.current[remoteId] = pc;

    const status = ensureNegotiationSettings(remoteId);

    // PERFECT NEGOTIATION: Decide who is 'polite' based on Socket IDs.
    // One user must be polite, the other impolite so they don't fight.
    const myId = socketRef.current?.id;
    if (myId) {
      status.polite = myId.localeCompare(remoteId) < 0;
      console.log(
        `🎭 Role for ${remoteId}: ${status.polite ? 'POLITE' : 'IMPOLITE'}`
      );
    }

    // Add our local camera/mic tracks to this connection
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    // --- WebRTC Event Handlers ---

    // Called when the connection needs to be updated (e.g., adding/removing tracks)
    pc.onnegotiationneeded = async () => {
      try {
        status.makingOffer = true;
        await pc.setLocalDescription();
        console.log(`🔔 Sending offer to: ${remoteId}`);

        socketRef.current?.emit('offer', {
          meetingId: roomIdRef.current,
          offer: pc.localDescription,
          to: remoteId,
        });
      } catch (err) {
        console.error('Negotiation Error:', err);
      } finally {
        status.makingOffer = false;
      }
    };

    // Called when a network path is found
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketRef.current?.emit('ice-candidate', {
          meetingId: roomIdRef.current,
          candidate,
          to: remoteId,
        });
      }
    };

    // Called when we receive video/audio from the remote user
    pc.ontrack = ({ track, streams }) => {
      console.log(`📥 Received ${track.kind} track from: ${remoteId}`);
      if (streams[0]) {
        setReceivedStreams((prev) => ({ ...prev, [remoteId]: streams[0] }));
        setParticipants((prev) =>
          prev.map((p) =>
            p.socketId === remoteId ? { ...p, stream: streams[0] } : p
          )
        );
      }
    };

    // Called when the connection status changes (connected, disconnected, failed)
    pc.onconnectionstatechange = () => {
      console.log(
        `🔄 Connection for ${remoteId} is now: ${pc.connectionState}`
      );
      setConnectionStates((prev) => ({
        ...prev,
        [remoteId]: pc.connectionState,
      }));
    };

    return pc;
  }, []);

  // --- 3. Signaling (Socket Message Handlers) ---

  /**
   * Handles an incoming Offer from another user.
   */
  const processIncomingOffer = useCallback(
    async ({ offer, from }) => {
      let pc = activeConnections.current[from];
      if (!pc) pc = initializeNewConnection(from);

      const status = ensureNegotiationSettings(from);

      // Handle Signaling Collision (Glare)
      const offerCollision =
        status.makingOffer || pc.signalingState !== 'stable';
      const ignore = !status.polite && offerCollision;

      if (ignore) {
        console.log(
          `🛡️ Conflict! I am IMPOLITE, so I am ignoring the offer from: ${from}`
        );
        status.ignoreOffer = true;
        return;
      }

      status.ignoreOffer = false;
      try {
        console.log(`📨 Received offer from: ${from}`);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // After setting remote info, we send an Answer back
        if (pc.signalingState === 'have-remote-offer') {
          await pc.setLocalDescription();
          console.log(`📤 Sending answer to: ${from}`);
          socketRef.current?.emit('answer', {
            meetingId: roomIdRef.current,
            answer: pc.localDescription,
            to: from,
          });
        }
      } catch (err) {
        console.error('Offer Handling Error:', err);
      }
    },
    [initializeNewConnection]
  );

  /**
   * Handles an incoming Answer for an offer we sent.
   */
  const processIncomingAnswer = useCallback(async ({ answer, from }) => {
    const pc = activeConnections.current[from];
    const status = ensureNegotiationSettings(from);
    if (!pc) return;

    try {
      console.log(`📨 Received answer from: ${from}`);
      status.ignoreOffer = false;
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error('Answer Handling Error:', err);
    }
  }, []);

  /**
   * Handles incoming network path data from another user.
   */
  const processIncomingIceCandidate = useCallback(
    async ({ candidate, from }) => {
      const pc = activeConnections.current[from];
      const status = ensureNegotiationSettings(from);

      try {
        if (!pc || status.ignoreOffer) return;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        if (!status.ignoreOffer) console.error('ICE Error:', err);
      }
    },
    []
  );

  /**
   * Updates state when a participant turns their camera/mic on or off.
   */
  const processParticipantMediaStatus = useCallback(
    ({ socketId, isCamOn, isMicOn }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === socketId ? { ...p, isCamOn, isMicOn } : p
        )
      );
    },
    []
  );

  // --- 4. Live Stream Management ---

  /**
   * Updates the camera/mic tracks for all existing connections.
   * This is used when the user toggles their camera/mic during the call.
   */
  const broadcastNewStreamToPeers = useCallback((newStream) => {
    if (!newStream) return;

    Object.keys(activeConnections.current).forEach((id) => {
      const pc = activeConnections.current[id];
      if (!pc || pc.connectionState === 'closed') return;

      const senders = pc.getSenders();
      const newTracks = newStream.getTracks();

      newTracks.forEach((newTrack) => {
        const sender = senders.find(
          (s) => s.track && s.track.kind === newTrack.kind
        );
        if (sender) {
          // Replace the old track with the new one smoothly
          sender
            .replaceTrack(newTrack)
            .catch((e) => console.error('Track replacement failed:', e));
        } else {
          // If this track type wasn't there before, add it
          pc.addTrack(newTrack, newStream);
        }
      });
    });
  }, []);

  // --- 5. Effect Listeners (Glue logic) ---

  // Listen for socket messages related to WebRTC
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('offer', processIncomingOffer);
    socket.on('answer', processIncomingAnswer);
    socket.on('ice-candidate', processIncomingIceCandidate);
    socket.on('participantMediaUpdate', processParticipantMediaStatus);

    return () => {
      socket.off('offer', processIncomingOffer);
      socket.off('answer', processIncomingAnswer);
      socket.off('ice-candidate', processIncomingIceCandidate);
      socket.off('participantMediaUpdate', processParticipantMediaStatus);
    };
  }, [
    socket,
    isConnected,
    processIncomingOffer,
    processIncomingAnswer,
    processIncomingIceCandidate,
    processParticipantMediaStatus,
  ]);

  // If our local camera/mic stream changes, tell all peers
  useEffect(() => {
    if (localStream) {
      broadcastNewStreamToPeers(localStream);
    }
  }, [localStream, broadcastNewStreamToPeers]);

  // Return everything needed by the InterviewScreen component
  return {
    participants,
    setParticipants,
    createPeerConnection: initializeNewConnection, // Re-mapped to original name for compatibility
    cleanupPeerConnection: removePeerConnection,
    cleanupAllConnections: removeAllConnections,
    updateStreamInConnections: broadcastNewStreamToPeers,
    remoteStreams: receivedStreams,
    connectionStates,
  };
};
