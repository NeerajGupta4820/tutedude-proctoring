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
  // Code Editor props
  currentQuestion,
  code,
  setCode,
  language,
  setLanguage,
  // Question Panel props
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  // Chat Panel props
  chatMessages,
  handleSendMessage,
  user,
  // Whiteboard props
  actualRoomId,
  socket,
  // Candidate props
  candidateData,
  loadingCandidate,
}) => {
  if (!activePanel) return null;

  // ✅ Define isAdmin here using the user prop
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
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          currentUser={user}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'whiteboard' && (
        <WhiteboardPanel
          onClose={() => setActivePanel(null)}
          meetingId={actualRoomId}
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

      {/* ✅ Fixed: Use isAdmin and user instead of undefined variables */}
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
