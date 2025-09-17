import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import InterviewScreen from './pages/InterviewScreen';
import ReportPage from './pages/ReportPage';
import InterviewSystemCheckError from './pages/InterviewSystemCheckError';
import InterviewFaceInput from './pages/InterviewFaceInput';
import InterviewConfirmFaceInput from './pages/InterviewConfirmFaceInput';
import Login from './pages/Login';
import MeetingSetup from './pages/MeetingSetup';
import Signup from './pages/Signup';
import EndMeeting from './pages/EndMeeting';
import { AuthProvider, AuthContext } from './components/AuthContext';
import AdminEndMeeting from './pages/AdminEndMeeting';
import Dashboard from './pages/Dashboard';



const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/system-check-error" element={<InterviewSystemCheckError />} />
                <Route path="/face-input" element={<InterviewFaceInput />} />
                <Route path="/confirm-face-input" element={<InterviewConfirmFaceInput />} />
                <Route path="/meetingsetup" element={<MeetingSetup />} />
                <Route path="/interview" element={<InterviewScreen />} />
                <Route path="/endmeeting" element={<EndMeeting />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/admin-end-meeting/:id" element={<AdminEndMeeting />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
