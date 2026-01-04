// components/interview/RightPanel.jsx
import React from 'react';
import CodeEditor from '../tools/CodeEditor';
import QuestionPanel from '../tools/QuestionPanel';
import ChatPanel from '../tools/ChatPanel';
import WhiteboardPanel from '../tools/WhiteboardPanel';
import CandidateProfilePanel from '../tools/CandidateProfilePanel';
import ResumePanel from '../tools/ResumePanel';

const RightPanel = ({
  activePanel,
  setActivePanel,
  currentQuestion,
  code,
  setCode,
  language,
  setLanguage,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  meetingId,
  socket,
  user,
  participants,
  candidateData,
  loadingCandidate,
  whiteboardFullscreen = false,
  setWhiteboardFullscreen,
}) => {
  // If whiteboard is fullscreen, render it separately
  if (activePanel === 'whiteboard' && whiteboardFullscreen) {
    return (
      <WhiteboardPanel
        onClose={() => setActivePanel(null)}
        meetingId={meetingId}
        socket={socket}
        isInterviewer={user?.role === 'admin'}
        userName={user?.name || 'User'}
        isFullscreen={whiteboardFullscreen}
        onFullscreenChange={setWhiteboardFullscreen}
      />
    );
  }

  if (!activePanel) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="w-[480px] h-full border-l border-gray-300 bg-white flex-shrink-0 transition-all duration-300 ease-in-out">
      {activePanel === 'code' && (
        <CodeEditor
          question={currentQuestion}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          visible={true}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'question' && (
        <QuestionPanel
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'chat' && (
        <ChatPanel
          meetingId={meetingId}
          socket={socket}
          currentUser={user}
          participants={participants}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'whiteboard' && !whiteboardFullscreen && (
        <WhiteboardPanel
          onClose={() => setActivePanel(null)}
          meetingId={meetingId}
          socket={socket}
          isInterviewer={isAdmin}
          userName={user?.name || 'User'}
          isFullscreen={whiteboardFullscreen}
          onFullscreenChange={setWhiteboardFullscreen}
        />
      )}

      {activePanel === 'profile' && isAdmin && (
        <CandidateProfilePanel
          candidate={candidateData}
          onClose={() => setActivePanel(null)}
          loading={loadingCandidate}
        />
      )}

      {activePanel === 'resume' && (
        <ResumePanel
          candidate={isAdmin ? candidateData : null}
          userResume={!isAdmin ? user?.resume : null}
          onClose={() => setActivePanel(null)}
          loading={loadingCandidate}
        />
      )}
    </div>
  );
};

export default RightPanel;
