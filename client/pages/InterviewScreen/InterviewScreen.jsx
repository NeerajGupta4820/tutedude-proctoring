// pages/InterviewScreen/InterviewScreen.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

// Components
import InterviewHeader from '../../components/interview/InterviewHeader';
import VideoSection from '../../components/interview/VideoSection';
import BottomControls from '../../components/interview/BottomControls';
import RightPanel from '../../components/interview/RightPanel';
import ToolsBar from '../../components/tools/ToolsBar';

// Hooks
import { useMediaStream } from './hooks/useMediaStream';
import { useSocketEvents } from './hooks/useSocketEvents';
import { useWebRTC } from './hooks/useWebRTC';
import { API_BASE_URL } from './constants';

const InterviewScreen = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state || {};

  const searchParams = new URLSearchParams(location.search);
  const meetingId = searchParams.get('meetingId') || navState.meetingId || 'default_meeting';

  // UI States
  const [layout, setLayout] = useState('speaker');
  const [showParticipants, setShowParticipants] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [timer, setTimer] = useState('00:00');
  
  // Meeting Data States
  const [meetingData, setMeetingData] = useState(null);
  const [actualRoomId, setActualRoomId] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  // Additional State needed for RightPanel sync (from original code)
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // Custom Hooks
  // 1. Media (Camera/Mic)
  const { 
    camOn, micOn, localStream, permissionError, videoRef, 
    toggleCamera, toggleMic, getMediaStream 
  } = useMediaStream(navState);

  // 2. Socket (Signaling & Events)
  const {
    socket, isConnected, isReconnecting,
    whiteboardFullscreen, setWhiteboardFullscreen,
    questionFullscreen, setQuestionFullscreen,
    questionVisibleToCandidate, setQuestionVisibleToCandidate,
    currentQuestionIndex, setCurrentQuestionIndex, questions, setQuestions,
    questionsSyncedRef
  } = useSocketEvents(actualRoomId, user);

  // 3. WebRTC (Video calling)
  const {
    participants, setParticipants,
    createPeerConnection, cleanupPeerConnection, cleanupAllConnections, updateStreamInConnections, 
    remoteStreams, connectionStates
  } = useWebRTC(socket, actualRoomId, isConnected, localStream);

  const remoteVideoRefs = useRef({});

  const isAdmin = user?.role === 'admin';
  const isCandidate = user?.role === 'candidate';

  // --- Effects & Logic ---

  // Keep questions logic simple here as it's complex to fully extract without refactoring subcomponents
  const questionsRef = useRef([]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Panel Management
  useEffect(() => {
    if (isCandidate && !questionVisibleToCandidate && activePanel === 'question') {
      setActivePanel('chat');
    }
  }, [questionVisibleToCandidate, isCandidate, activePanel]);

  // Question Sync (Admin)
  useEffect(() => {
    if (isAdmin && questions.length > 0 && socket?.connected && actualRoomId && !questionsSyncedRef.current) {
        socket.emit('question-sync-data', {
            meetingId: actualRoomId,
            questions: questions
        });
        questionsSyncedRef.current = true;
    }
  }, [isAdmin, questions, actualRoomId, socket, questionsSyncedRef]);

  // WebRTC & Socket Glue
  useEffect(() => {
    if (!socket) return;
    
    const onExistingParticipants = (existingUsers) => {
        existingUsers.forEach((p) => {
            if (p.id !== user.id) createPeerConnection(p.socketId, true);
        });
    };

    const onSendOfferTo = ({ targetSocketId }) => {
        createPeerConnection(targetSocketId, true);
    };

    const onParticipantLeft = ({ odlid }) => {
        cleanupPeerConnection(odlid);
    };
    
    const onParticipantsUpdate = (list) => {
         setParticipants(list.map(p => ({
             ...p,
             stream: remoteStreams[p.socketId] || undefined
         })));
    };

    socket.on('existingParticipants', onExistingParticipants);
    socket.on('sendOfferTo', onSendOfferTo);
    socket.on('participantLeft', onParticipantLeft);
    socket.on('participantsUpdate', onParticipantsUpdate);

    return () => {
        socket.off('existingParticipants', onExistingParticipants);
        socket.off('sendOfferTo', onSendOfferTo);
        socket.off('participantLeft', onParticipantLeft);
        socket.off('participantsUpdate', onParticipantsUpdate);
    };
  }, [socket, user, createPeerConnection, cleanupPeerConnection, remoteStreams, setParticipants]);


  // Timer
  useEffect(() => {
      const startTime = Date.now();
      const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const minutes = Math.floor(elapsed / 60000);
          const seconds = Math.floor((elapsed % 60000) / 1000);
          setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  // Ready to Connect
  useEffect(() => {
      if (localStream && socket?.connected && actualRoomId) {
          socket.emit('readyToConnect', { meetingId: actualRoomId });
      }
  }, [localStream, isConnected, actualRoomId, socket]);

  // Sync Media State
  useEffect(() => {
    if (socket && isConnected && actualRoomId) {
      socket.emit('mediaStateUpdate', {
        meetingId: actualRoomId,
        isCamOn: camOn,
        isMicOn: micOn
      });
    }
  }, [camOn, micOn, socket, isConnected, actualRoomId]);

  // Fetch Data (Meeting, etc.)
  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    
    const fetchCandidateData = async (meeting) => {
        setLoadingCandidate(true);
        try {
             let candidateId = null;
             let candidate = null;

             if (meeting.candidate) {
                if (typeof meeting.candidate === 'object' && meeting.candidate._id) candidateId = meeting.candidate._id;
                else if (typeof meeting.candidate === 'string') candidateId = meeting.candidate;
             }
             
             if (candidateId) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/candidate/${candidateId}`, { headers });
                    if (res.data.success && res.data.data) candidate = res.data.data;
                } catch (e) {
                     if (meeting.candidate && typeof meeting.candidate === 'object') candidate = meeting.candidate;
                }
             }
             
             if (!candidate) {
                  candidate = {
                    _id: meeting.candidate?._id || 'unknown',
                    name: meeting.candidate?.name || meeting.candidateName || 'Candidate',
                    email: meeting.candidate?.email || meeting.candidateEmail || 'N/A',
                    phone: meeting.candidate?.phone || '',
                    position: meeting.candidate?.position || meeting.interviewConfig?.jobRole || 'Software Engineer',
                    photo: null, resume: null, experience: 'Not specified', status: 'pending', isApproved: false,
                  };
             }

             setCandidateData(candidate);
        } catch (err) {
            setCandidateData(null);
        } finally {
            setLoadingCandidate(false);
        }
    };

    const fetchQuestions = async (meeting) => {
        if (isCandidate) {
            setQuestions([]);
            return;
        }
        if (meeting?.assignedQuestions?.length > 0) {
            try {
                const questionIds = meeting.assignedQuestions.map(q => q.question?._id || q.question || q._id || q);
                const res = await axios.get(`${API_BASE_URL}/question/`, { params: { ids: questionIds.join(',') }, headers });
                setQuestions(res.data.data || []);
                questionsSyncedRef.current = false;
            } catch (err) { setQuestions([]); }
        } else { setQuestions([]); }
    };

    const fetchMeetingData = async () => {
        try {
            let roomIdToUse = meetingId;
            let meeting = null;
            if (meetingId.startsWith('meeting-')) {
                 try {
                     const response = await axios.get(`${API_BASE_URL}/meeting/`, { headers });
                     const meetings = response.data.data?.meetings || response.data.data || [];
                     meeting = meetings.find(m => m.roomId === meetingId);
                 } catch(e) {}
            } else {
                 try {
                    const response = await axios.get(`${API_BASE_URL}/meeting/${meetingId}`, { headers });
                    meeting = response.data.data;
                    if(meeting?.roomId) roomIdToUse = meeting.roomId;
                 } catch(e) {}
            }
            
            if(!meeting) meeting = { _id: roomIdToUse, roomId: roomIdToUse, interviewConfig: { jobRole: 'Technical Interview' } };
            
            setActualRoomId(roomIdToUse);
            setMeetingData(meeting);
            if(isAdmin) await fetchCandidateData(meeting); 
            await fetchQuestions(meeting);

        } catch (error) {
            setActualRoomId(meetingId);
            setMeetingData({ _id: meetingId, roomId: meetingId });
        }
    };

    if (meetingId && user) fetchMeetingData();

  }, [meetingId, user, isAdmin, isCandidate]);

  // Reconnect Handler
  const handleReconnect = useCallback(async () => {
    // Basic reconnect shim since hooks handle most logic
    cleanupAllConnections();
    if(socket) {
        socket.disconnect();
        socket.connect();
    }
  }, [cleanupAllConnections, socket]);

  // Leave Handler
  const handleLeave = useCallback(() => {
     if(localStream) localStream.getTracks().forEach(t => t.stop());
     cleanupAllConnections();
     if(socket) {
         socket.emit('leaveInterview', { meetingId: actualRoomId, userId: user?.id });
         socket.disconnect();
     }
     
     if(user?.role === 'admin') {
         navigate(`/admin-end-meeting/${meetingId}`, { state: { meeting: meetingData } });
     } else {
         navigate('/endmeeting', { state: { meetingId } });
     }
  }, [localStream, cleanupAllConnections, socket, actualRoomId, user, meetingId, meetingData, navigate]);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  // Render - MATCHING ORIGINAL STRUCTURE EXACTLY
  return (
    <div className="h-screen bg-gray-200 font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <InterviewHeader
        meetingData={meetingData}
        candidateData={candidateData}
        user={user}
        timer={timer}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex overflow-hidden">
            {/* VIDEO SECTION */}
            <VideoSection
              videoRef={videoRef}
              user={user}
              camOn={camOn}
              micOn={micOn}
              localStream={localStream}
              permissionError={permissionError}
              participants={participants}
              remoteStreams={remoteStreams}
              connectionStates={connectionStates}
              remoteVideoRefs={remoteVideoRefs}
              showParticipants={showParticipants}
              onCloseParticipants={() => setShowParticipants(false)}
              onRetryConnection={(socketId) =>
                createPeerConnection(socketId, true)
              }
            />

            {/* TOOLS BAR */}
            <ToolsBar
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              meetingData={meetingData}
              user={user}
              candidateData={candidateData}
              questionVisibleToCandidate={questionVisibleToCandidate}
            />
          </div>

          {/* BOTTOM CONTROLS */}
          <BottomControls
            micOn={micOn}
            camOn={camOn}
            layout={layout}
            isReconnecting={isReconnecting}
            participantsCount={participants.length}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleLayout={() =>
              setLayout(layout === 'grid' ? 'speaker' : 'grid')
            }
            onToggleParticipants={() => setShowParticipants((v) => !v)}
            onReconnect={handleReconnect}
            onLeave={handleLeave}
          />
        </div>

        {/* RIGHT PANEL */}
        <RightPanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          currentQuestion={currentQuestion}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          meetingId={actualRoomId}
          socket={socket}
          user={user}
          participants={participants}
          candidateData={candidateData}
          loadingCandidate={loadingCandidate}
          whiteboardFullscreen={whiteboardFullscreen}
          setWhiteboardFullscreen={setWhiteboardFullscreen}
          questionFullscreen={questionFullscreen}
          setQuestionFullscreen={setQuestionFullscreen}
          questionVisibleToCandidate={questionVisibleToCandidate}
          setQuestionVisibleToCandidate={setQuestionVisibleToCandidate}
        />
      </div>
    </div>
  );
};

export default InterviewScreen;
