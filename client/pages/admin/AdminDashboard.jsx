import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import Sidebar from '../../components/admin/admindashboard/Sidebar';
import MainLayout from '../../components/admin/admindashboard/mainlayout/MainLayout';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [checkingRole, setCheckingRole] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/');
    } else {
      setCheckingRole(false);
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, meetingsRes, questionsRes, candidatesRes] =
        await Promise.all([
          axios.get(`${API_URL}/meeting/users`, { headers }),
          axios.get(`${API_URL}/meeting`, { headers }),
          axios.get(`${API_URL}/question`, { headers }),
          axios.get(`${API_URL}/candidate/all`, { headers }),
        ]);

      setUsers(usersRes.data.data.filter((u) => u.role === 'user'));
      setMeetings(meetingsRes.data.data);
      setQuestions(questionsRes.data.data);
      setCandidates(candidatesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (checkingRole) return;
    fetchData();
  }, [checkingRole]);

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const upcomingMeetings = meetings.filter(
    (m) =>
      new Date(m.scheduledDate || m.date) >= new Date() &&
      m.status !== 'completed' &&
      m.status !== 'cancelled' &&
      !m.attended
  );

  return (
    <div className="flex min-h-screen bg-gray-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        meetings={meetings}
        upcomingMeetings={upcomingMeetings}
        questions={questions}
        users={users}
        candidates={candidates}
      />
      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        candidates={candidates}
        meetings={meetings}
        upcomingMeetings={upcomingMeetings}
        questions={questions}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default AdminDashboard;
