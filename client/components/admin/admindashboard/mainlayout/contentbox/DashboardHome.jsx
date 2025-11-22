import React from 'react';
import { FaCalendarAlt, FaUsers, FaQuestionCircle, FaCalendarCheck, FaArrowRight } from 'react-icons/fa';

const DashboardHome = ({ users, meetings, upcomingMeetings, questions, onNavigate }) => {
  const now = new Date();
  const todayMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledDate || m.date);
    return meetingDate.toDateString() === now.toDateString();
  });

  const completedMeetings = meetings.filter(m => m.attended);
  const passedMeetings = meetings.filter(m => m.result === 'pass');
  const passRate = completedMeetings.length > 0 
    ? Math.round((passedMeetings.length / completedMeetings.length) * 100) 
    : 0;

  const statsCards = [
    {
      title: 'Total Users',
      value: users.length,
      icon: FaUsers,
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      onClick: () => onNavigate('users')
    },
    {
      title: 'Total Meetings',
      value: meetings.length,
      icon: FaCalendarAlt,
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      onClick: () => onNavigate('all')
    },
    {
      title: 'Upcoming',
      value: upcomingMeetings.length,
      icon: FaCalendarCheck,
      lightColor: 'bg-green-50',
      textColor: 'text-green-700',
      onClick: () => onNavigate('upcoming')
    },
    {
      title: 'Questions',
      value: questions.length,
      icon: FaQuestionCircle,
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      onClick: () => onNavigate('questions')
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={stat.onClick}
              className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.lightColor} p-3 rounded-lg`}>
                  <Icon className={`text-2xl ${stat.textColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 font-semibold">{stat.title}</div>
            </button>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <div className="text-sm text-gray-600 font-semibold mb-2">Today's Meetings</div>
          <div className="text-3xl font-bold text-cyan-700">{todayMeetings.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <div className="text-sm text-gray-600 font-semibold mb-2">Completed</div>
          <div className="text-3xl font-bold text-cyan-700">{completedMeetings.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <div className="text-sm text-gray-600 font-semibold mb-2">Pass Rate</div>
          <div className="text-3xl font-bold text-cyan-700">{passRate}%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('create')}
            className="bg-cyan-700 hover:bg-cyan-800 text-white p-4 rounded-lg font-semibold transition flex items-center justify-between"
          >
            <span>Create New Meeting</span>
            <FaArrowRight />
          </button>
          <button
            onClick={() => onNavigate('upcoming')}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold transition flex items-center justify-between"
          >
            <span>View Upcoming</span>
            <FaArrowRight />
          </button>
          <button
            onClick={() => onNavigate('questions')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg font-semibold transition flex items-center justify-between"
          >
            <span>Manage Questions</span>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Recent Meetings</h3>
          <button 
            onClick={() => onNavigate('all')}
            className="text-cyan-700 hover:text-cyan-800 font-semibold text-sm"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {meetings.slice(0, 5).map(m => (
            <div key={m._id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold">
                  {m.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{m.user?.name}</div>
                  <div className="text-sm text-gray-600">
                    {m.interviewConfig?.jobRole || m.jobRole} - {m.interviewConfig?.round || m.round}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {new Date(m.scheduledDate || m.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-cyan-700 font-semibold">{m.startTime || m.time}</div>
              </div>
            </div>
          ))}
          {meetings.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No meetings scheduled yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;