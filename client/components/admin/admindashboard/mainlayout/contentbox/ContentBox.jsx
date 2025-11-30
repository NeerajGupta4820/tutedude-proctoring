import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import CreateMeeting from './CreateMeeting';
import AllMeetings from './AllMeetings';
import UpcomingMeetings from './UpcomingMeetings';
import QuestionManager from './QuestionManager';
import CreateQuestion from './CreateQuestion';
import CandidateManagement from './CandidateManagement';
import CreateCandidate from './CreateCandidate';
import InterviewerManagement from './InterviewerManagement';

const ContentBox = ({
  activeTab,
  setActiveTab,
  users,
  meetings,
  upcomingMeetings,
  questions,
  candidates,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setActiveTab('create-question');
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {activeTab === 'dashboard' && (
        <DashboardHome
          users={users}
          meetings={meetings}
          upcomingMeetings={upcomingMeetings}
          questions={questions}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow p-6">
          <CreateMeeting
            users={candidates}
            questions={questions}
            onMeetingCreated={onUpdate}
          />
        </div>
      )}

      {activeTab === 'upcoming' && (
        <UpcomingMeetings meetings={upcomingMeetings} navigate={navigate} />
      )}

      {activeTab === 'all' && (
        <AllMeetings meetings={meetings} navigate={navigate} />
      )}

      {activeTab === 'questions' && (
        <QuestionManager
          questions={questions}
          onUpdate={onUpdate}
          onEdit={handleEditQuestion}
        />
      )}

      {activeTab === 'create-question' && (
        <CreateQuestion
          editingQuestion={editingQuestion}
          onUpdate={() => {
            onUpdate();
            setActiveTab('questions');
            setEditingQuestion(null);
          }}
          onCancel={() => {
            setActiveTab('questions');
            setEditingQuestion(null);
          }}
        />
      )}

      {activeTab === 'candidates' && (
        <CandidateManagement candidates={candidates} onUpdate={onUpdate} />
      )}

      {activeTab === 'create-candidate' && (
        <CreateCandidate
          onCandidateCreated={() => {
            onUpdate();
            setActiveTab('candidates');
          }}
        />
      )}

      {activeTab === 'interviewers' && (
        <InterviewerManagement onUpdate={onUpdate} />
      )}
    </div>
  );
};

export default ContentBox;
