import React from 'react';
import {
  FaCalendarAlt,
  FaUsers,
  FaQuestionCircle,
  FaCalendarCheck,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaVideo,
  FaUserTie,
  FaPlus,
} from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';

const DashboardHome = ({
  users,
  meetings,
  upcomingMeetings,
  questions,
  onNavigate,
}) => {
  const now = new Date();
  const todayMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.scheduledDate || m.date);
    return meetingDate.toDateString() === now.toDateString();
  });

  const completedMeetings = meetings.filter((m) => m.attended);
  const passedMeetings = meetings.filter((m) => m.result === 'pass');
  const passRate =
    completedMeetings.length > 0
      ? Math.round((passedMeetings.length / completedMeetings.length) * 100)
      : 0;

  const statsCards = [
    {
      title: 'Total Users',
      value: users.length,
      icon: FaUsers,
      color: 'blue',
      onClick: () => onNavigate('users'),
    },
    {
      title: 'All Meetings',
      value: meetings.length,
      icon: FaCalendarAlt,
      color: 'blue',
      onClick: () => onNavigate('all'),
    },
    {
      title: 'Upcoming',
      value: upcomingMeetings.length,
      icon: FaCalendarCheck,
      color: 'blue',
      onClick: () => onNavigate('upcoming'),
    },
    {
      title: 'Questions',
      value: questions.length,
      icon: FaQuestionCircle,
      color: 'blue',
      onClick: () => onNavigate('questions'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg shadow-sm">
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-500 text-sm">
            Track and manage all your interview meetings in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.onClick}
                className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon className="text-blue-600" size={18} />
                  </div>
                  <FaArrowRight
                    className="text-gray-300 group-hover:text-blue-500 transition-colors"
                    size={12}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onNavigate('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <FaVideo size={14} />
                  <span>New Meeting</span>
                </button>
                <button
                  onClick={() => onNavigate('upcoming')}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-gray-200"
                >
                  <FaCalendarCheck size={14} />
                  <span>Upcoming</span>
                </button>
                <button
                  onClick={() => onNavigate('create-question')}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-gray-200"
                >
                  <FaPlus size={14} />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Recent Meetings */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Recent Meetings
                </h2>
                <button
                  onClick={() => onNavigate('all')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
                >
                  View All
                  <FaArrowRight size={10} />
                </button>
              </div>

              <div className="space-y-3">
                {meetings.slice(0, 4).map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {m.user?.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{m.interviewConfig?.jobRole || m.jobRole}</span>
                          <BsDot />
                          <span>{m.interviewConfig?.round || m.round}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(m.scheduledDate || m.date).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        <FaClock size={10} />
                        {m.startTime || m.time}
                      </p>
                    </div>
                  </div>
                ))}

                {meetings.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FaCalendarAlt className="text-xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      No meetings yet
                    </p>
                    <button
                      onClick={() => onNavigate('create')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Schedule First Meeting
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Overview */}
            <div className="bg-blue-600 rounded-xl p-5 text-white">
              <h3 className="text-sm font-medium mb-4 text-blue-100">
                Today's Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">{todayMeetings.length}</p>
                  <p className="text-blue-200 text-sm">Meetings Today</p>
                </div>
                <div className="h-px bg-blue-500" />
                <div className="flex justify-between items-center">
                  <span className="text-blue-200 text-sm">Completed</span>
                  <span className="text-xl font-bold">
                    {completedMeetings.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">Pass Rate</span>
                    <span className="text-xl font-bold text-green-600">
                      {passRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${passRate}%` }}
                    />
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Passed</span>
                    <span className="font-semibold text-gray-900">
                      {passedMeetings.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Failed</span>
                    <span className="font-semibold text-gray-900">
                      {completedMeetings.length - passedMeetings.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaUserTie className="text-gray-400" size={14} />
                Active Users
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.isActive !== false).length}
                  </p>
                  <p className="text-xs text-gray-500">Active this week</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
