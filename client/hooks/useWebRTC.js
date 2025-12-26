// hooks/useWebRTC.js
import { useRef, useState, useCallback, useEffect } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = (socket, roomId, userId, localStream) => {
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStates, setConnectionStates] = useState({});

  // ✅ Create peer connection with fast ICE
  const createPeerConnection = useCallback((targetSocketId, isInitiator = false) => {
    console.log(`🔌 Creating PC for ${targetSocketId}, initiator: ${isInitiator}`);

    // Close existing connection
    if (peerConnections.current[targetSocketId]) {
      peerConnections.current[targetSocketId].close();
      delete peerConnections.current[targetSocketId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[targetSocketId] = pc;
    pendingCandidates.current[targetSocketId] = [];

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log(`📺 Track received from ${targetSocketId}:`, event.track.kind);
      const stream = event.streams[0];
      if (stream) {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: stream,
        }));
      }
    };

    // Handle ICE candidates - send immediately
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          meetingId: roomId,
          candidate: event.candidate,
          to: targetSocketId,
        });
      }
    };

    // Connection state tracking
    pc.onconnectionstatechange = () => {
      console.log(`🔗 PC ${targetSocketId} state: ${pc.connectionState}`);
      setConnectionStates((prev) => ({
        ...prev,
        [targetSocketId]: pc.connectionState,
      }));

      if (pc.connectionState === 'failed') {
        console.log(`❌ Connection failed, attempting restart for ${targetSocketId}`);
        restartConnection(targetSocketId);
      }

      if (pc.connectionState === 'disconnected') {
        // Wait a bit before cleanup - might reconnect
        setTimeout(() => {
          if (pc.connectionState === 'disconnected') {
            cleanupConnection(targetSocketId);
          }
        }, 5000);
      }
    };

    // ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log(`🧊 ICE gathering: ${pc.iceGatheringState} for ${targetSocketId}`);
    };

    // ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection: ${pc.iceConnectionState} for ${targetSocketId}`);
      
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };

    // If initiator, create offer
    if (isInitiator) {
      createOffer(targetSocketId, pc);
    }

    return pc;
  }, [socket, roomId, localStream]);

  // ✅ Create and send offer
  const createOffer = useCallback(async (targetSocketId, pc) => {
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true,
      });
      await pc.setLocalDescription(offer);
      
      socket?.emit('offer', {
        meetingId: roomId,
        offer: pc.localDescription,
        to: targetSocketId,
      });
      
      console.log(`📤 Offer sent to ${targetSocketId}`);
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, [socket, roomId]);

  // ✅ Handle incoming offer
  const handleOffer = useCallback(async ({ offer, from }) => {
    console.log(`📥 Offer from ${from}`);
    
    let pc = peerConnections.current[from];
    if (!pc) {
      pc = createPeerConnection(from, false);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Add any pending ICE candidates
      if (pendingCandidates.current[from]?.length > 0) {
        for (const candidate of pendingCandidates.current[from]) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current[from] = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket?.emit('answer', {
        meetingId: roomId,
        answer: pc.localDescription,
        to: from,
      });
      
      console.log(`📤 Answer sent to ${from}`);
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  }, [socket, roomId, createPeerConnection]);

  // ✅ Handle incoming answer
  const handleAnswer = useCallback(async ({ answer, from }) => {
    console.log(`📥 Answer from ${from}`);
    const pc = peerConnections.current[from];
    
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Add any pending ICE candidates
        if (pendingCandidates.current[from]?.length > 0) {
          for (const candidate of pendingCandidates.current[from]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.current[from] = [];
        }
        
        console.log(`✅ Answer processed for ${from}`);
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  }, []);

  // ✅ Handle ICE candidate with buffering
  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    const pc = peerConnections.current[from];
    
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    } else {
      // Buffer candidate until remote description is set
      if (!pendingCandidates.current[from]) {
        pendingCandidates.current[from] = [];
      }
      pendingCandidates.current[from].push(candidate);
    }
  }, []);

  // ✅ Restart connection
  const restartConnection = useCallback((targetSocketId) => {
    const pc = peerConnections.current[targetSocketId];
    if (pc) {
      createOffer(targetSocketId, pc);
    }
  }, [createOffer]);

  // ✅ Cleanup connection
  const cleanupConnection = useCallback((targetSocketId) => {
    console.log(`🗑️ Cleaning up connection for ${targetSocketId}`);
    
    const pc = peerConnections.current[targetSocketId];
    if (pc) {
      pc.close();
      delete peerConnections.current[targetSocketId];
    }
    
    delete pendingCandidates.current[targetSocketId];
    
    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[targetSocketId];
      return newStreams;
    });
    
    setConnectionStates((prev) => {
      const newStates = { ...prev };
      delete newStates[targetSocketId];
      return newStates;
    });
  }, []);

  // ✅ Update local stream in all connections
  const updateLocalStream = useCallback((newStream) => {
    Object.entries(peerConnections.current).forEach(([socketId, pc]) => {
      const senders = pc.getSenders();
      
      newStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          pc.addTrack(track, newStream);
        }
      });
    });
  }, []);

  // ✅ Cleanup all connections
  const cleanupAll = useCallback(() => {
    Object.keys(peerConnections.current).forEach((socketId) => {
      cleanupConnection(socketId);
    });
  }, [cleanupConnection]);

  return {
    peerConnections: peerConnections.current,
    remoteStreams,
    connectionStates,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanupConnection,
    cleanupAll,
    updateLocalStream,
    restartConnection,
  };
};

export default useWebRTC;