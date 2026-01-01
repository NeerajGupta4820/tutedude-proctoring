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
  participants, // Add this prop
  candidateData,
  loadingCandidate,
}) => {
  if (!activePanel) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="w-[480px] h-full border-l border-gray-300 bg-white flex-shrink-0">
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
          participants={participants} // Pass participants here
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'whiteboard' && (
        <WhiteboardPanel
          onClose={() => setActivePanel(null)}
          meetingId={meetingId}
          socket={socket}
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
