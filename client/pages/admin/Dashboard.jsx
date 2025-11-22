import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateMeeting from './CreateMeeting';
import UpcomingMeetings from './UpcomingMeetings';
import AllMeetings from './AllMeetings';
import QuestionManager from './QuestionManager';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState('create');

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
      
      const [usersRes, meetingsRes, questionsRes] = await Promise.all([
        axios.get(`${API_URL}/meeting/users`, { headers }),
        axios.get(`${API_URL}/meeting`, { headers }),
        axios.get(`${API_URL}/question`, { headers }),
      ]);

      setUsers(usersRes.data.data.filter(u => u.role === 'user'));
      setMeetings(meetingsRes.data.data);
      setQuestions(questionsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (checkingRole) return;
    fetchData();
  }, [checkingRole]);

  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledDate) >= now);

  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'create', label: '📅 Create Meeting', icon: '➕' },
    { id: 'upcoming', label: '🎯 Upcoming Events', badge: upcomingMeetings.length },
    { id: 'all', label: '📋 All Meetings', badge: meetings.length },
    { id: 'questions', label: '❓ Questions', badge: questions.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-700">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage meetings, questions, and interviews</p>
        </div>
        <button 
          onClick={logout} 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-cyan-700 border-b-2 border-cyan-700 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id 
                      ? 'bg-cyan-700 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'create' && (
          <CreateMeeting users={users} questions={questions} onMeetingCreated={fetchData} />
        )}
        
        {activeTab === 'upcoming' && (
          <UpcomingMeetings meetings={upcomingMeetings} navigate={navigate} />
        )}
        
        {activeTab === 'all' && (
          <AllMeetings meetings={meetings} navigate={navigate} />
        )}
        
        {activeTab === 'questions' && (
          <QuestionManager questions={questions} onUpdate={fetchData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;