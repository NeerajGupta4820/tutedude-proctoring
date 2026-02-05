import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHome from './Dashboard/DashboardHome';
import CreateMeeting from './MeetingManager/CreateMeeting';
import AllMeetings from './MeetingManager/AllMeetings';
import UpcomingMeetings from './MeetingManager/UpcomingMeetings';
import QuestionManager from './QuestionManager/QuestionManager';
import CreateQuestion from './QuestionManager/CreateQuestion';
import UpdateQuestion from './QuestionManager/UpdateQuestion';
import CandidateManagement from './CandidateManager/CandidateManagement';
import CreateCandidate from './CandidateManager/CreateCandidate';
import UpdateCandidate from './CandidateManager/UpdateCandidate';
import CandidateProfile from './CandidateManager/CandidateProfile';
import CandidateResults from './CandidateManager/CandidateResults';
import InterviewerManagement from './InterviewerManagement';
import SettingsPanel from '../../SettingsPanel';

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
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Question handlers
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setActiveTab('edit-question');
  };

  // Candidate handlers
  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setActiveTab('edit-candidate');
  };

  const handleViewCandidate = (candidate) => {
    setViewingCandidate(candidate);
    setActiveTab('view-candidate');
  };

  const handleCandidateUpdated = () => {
    onUpdate();
    setEditingCandidate(null);
    setActiveTab('candidates');
  };

  const handleCandidateViewClose = () => {
    setViewingCandidate(null);
    setActiveTab('candidates');
  };

  const handleCandidateEditFromView = () => {
    setEditingCandidate(viewingCandidate);
    setViewingCandidate(null);
    setActiveTab('edit-candidate');
  };

  const handleViewResultsFromProfile = () => {
    setViewingCandidate(null);
    setActiveTab('results');
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <DashboardHome
          users={users}
          meetings={meetings}
          upcomingMeetings={upcomingMeetings}
          questions={questions}
          onNavigate={setActiveTab}
        />
      )}

      {/* Meeting Management */}
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

      {/* Question Management */}
      {activeTab === 'questions' && (
        <QuestionManager
          questions={questions}
          onUpdate={onUpdate}
          onEdit={handleEditQuestion}
        />
      )}

      {activeTab === 'create-question' && (
        <CreateQuestion
          onUpdate={() => {
            onUpdate();
            setActiveTab('questions');
          }}
          onCancel={() => setActiveTab('questions')}
        />
      )}

      {activeTab === 'edit-question' && editingQuestion && (
        <UpdateQuestion
          question={editingQuestion}
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

      {/* Candidate Management */}
      {activeTab === 'candidates' && (
        <CandidateManagement
          candidates={candidates}
          onUpdate={onUpdate}
          onEdit={handleEditCandidate}
          onView={handleViewCandidate}
        />
      )}

      {activeTab === 'create-candidate' && (
        <CreateCandidate
          onCandidateCreated={() => {
            onUpdate();
            setActiveTab('candidates');
          }}
          onCancel={() => setActiveTab('candidates')}
        />
      )}

      {activeTab === 'edit-candidate' && editingCandidate && (
        <UpdateCandidate
          candidate={editingCandidate}
          onUpdate={handleCandidateUpdated}
          onCancel={() => {
            setEditingCandidate(null);
            setActiveTab('candidates');
          }}
        />
      )}

      {activeTab === 'view-candidate' && viewingCandidate && (
        <CandidateProfile
          candidate={viewingCandidate}
          onBack={handleCandidateViewClose}
          onEdit={handleCandidateEditFromView}
          onUpdate={onUpdate}
          onViewResults={handleViewResultsFromProfile}
        />
      )}

      {/* Candidate Results */}
      {activeTab === 'results' && (
        <CandidateResults
          candidates={candidates}
          meetings={meetings}
          onViewCandidate={handleViewCandidate}
        />
      )}

      {/* Interviewer Management */}
      {activeTab === 'interviewers' && (
        <InterviewerManagement onUpdate={onUpdate} />
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <SettingsPanel />
      )}
    </div>
  );
};

export default ContentBox;

