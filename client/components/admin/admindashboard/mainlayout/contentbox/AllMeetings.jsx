import React, { useState } from 'react';
import {
  FaThLarge,
  FaList,
  FaSortAmountDown,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaClock,
  FaEdit,
  FaEye,
} from 'react-icons/fa';
import UpdateMeeting from './UpdateMeeting';

const AllMeetings = ({
  meetings,
  users,
  questions,
  navigate,
  onMeetingsUpdate,
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('date-desc'); // sorting option
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Handle update button click
  const handleUpdateClick = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setShowUpdateModal(true);
  };

  // Handle update completion
  const handleUpdateComplete = () => {
    setShowUpdateModal(false);
    setSelectedMeetingId(null);
    // Refresh meetings list if callback provided
    if (onMeetingsUpdate) {
      onMeetingsUpdate();
    }
  };

  // Handle cancel update
  const handleCancelUpdate = () => {
    setShowUpdateModal(false);
    setSelectedMeetingId(null);
  };

  // Sorting function
  const getSortedMeetings = () => {
    let sorted = [...meetings];

    switch (sortBy) {
      case 'date-asc':
        return sorted.sort(
          (a, b) =>
            new Date(a.scheduledDate || a.date) -
            new Date(b.scheduledDate || b.date)
        );
      case 'date-desc':
        return sorted.sort(
          (a, b) =>
            new Date(b.scheduledDate || b.date) -
            new Date(a.scheduledDate || a.date)
        );
      case 'name-asc':
        return sorted.sort((a, b) =>
          (a.user?.name || '').localeCompare(b.user?.name || '')
        );
      case 'name-desc':
        return sorted.sort((a, b) =>
          (b.user?.name || '').localeCompare(a.user?.name || '')
        );
      case 'status-attended':
        return sorted.sort(
          (a, b) => (b.attended ? 1 : 0) - (a.attended ? 1 : 0)
        );
      case 'status-pending':
        return sorted.sort(
          (a, b) => (a.attended ? 1 : 0) - (b.attended ? 1 : 0)
        );
      case 'rating-high':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating-low':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      default:
        return sorted;
    }
  };

  const sortedMeetings = getSortedMeetings();

  // If update modal is shown, render UpdateMeeting component
  if (showUpdateModal && selectedMeetingId) {
    return (
      <UpdateMeeting
        meetingId={selectedMeetingId}
        users={users}
        questions={questions}
        onMeetingUpdated={handleUpdateComplete}
        onCancel={handleCancelUpdate}
      />
    );
  }

  // Empty state
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-600">
          <svg
            className="w-20 h-20 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-xl font-semibold text-gray-900">
            No Meetings Found
          </p>
          <p className="mt-2 text-sm">
            Create your first meeting to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">
            Total Meetings
          </p>
          <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Attended</p>
          <p className="text-2xl font-bold text-green-600">
            {meetings.filter((m) => m.attended).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {meetings.filter((m) => !m.attended).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Pass Rate</p>
          <p className="text-2xl font-bold text-cyan-600">
            {meetings.filter((m) => m.attended).length > 0
              ? Math.round(
                  (meetings.filter((m) => m.result === 'pass').length /
                    meetings.filter((m) => m.attended).length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left - Title */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Meetings
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Showing {sortedMeetings.length} interviews
            </p>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-400 text-sm" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="status-attended">Attended First</option>
                <option value="status-pending">Pending First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-gray-600'
                }`}
                title="List View"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-gray-600'
                }`}
                title="Grid View"
              >
                <FaThLarge />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedMeetings.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section - User Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {m.user?.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {m.user?.email}
                    </div>
                  </div>
                </div>

                {/* Middle Section - Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      Date
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {new Date(m.scheduledDate || m.date).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {m.startTime || m.time}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FaBriefcase className="text-gray-400" />
                      Role
                    </div>
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {m.interviewConfig?.jobRole || m.jobRole}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {m.interviewConfig?.round || m.round}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Status</div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.attended
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      {m.attended ? 'Attended' : 'Pending'}
                    </span>
                    {m.rating && (
                      <div className="text-xs font-medium text-gray-900 mt-1">
                        ⭐ {m.rating}/10
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Result</div>
                    {m.result && m.result !== 'pending' ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.result === 'pass'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {m.result === 'pass' ? 'Pass' : 'Fail'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    onClick={() =>
                      navigate(
                        `/interview?meetingId=${m.roomId || m._id}&admin=1`
                      )
                    }
                  >
                    <FaEye className="text-xs" />
                    Join
                  </button>
                  <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm border border-gray-200 transition-colors flex items-center gap-2"
                    onClick={() => handleUpdateClick(m._id)}
                    title="Update Meeting"
                  >
                    <FaEdit className="text-xs" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedMeetings.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {m.user?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {m.user?.email}
                  </div>
                </div>
                {m.result && m.result !== 'pending' && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      m.result === 'pass'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {m.result === 'pass' ? 'Pass' : 'Fail'}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400 text-sm flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Date & Time</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {new Date(m.scheduledDate || m.date).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}{' '}
                      • {m.startTime || m.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaBriefcase className="text-gray-400 text-sm flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Position</div>
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {m.interviewConfig?.jobRole || m.jobRole}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {m.interviewConfig?.round || m.round}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.attended
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      {m.attended ? 'Attended' : 'Pending'}
                    </span>
                  </div>
                  {m.rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Rating</div>
                      <div className="text-sm font-semibold text-gray-900">
                        ⭐ {m.rating}/10
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  className="flex-1 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  onClick={() =>
                    navigate(
                      `/interview?meetingId=${m.roomId || m._id}&admin=1`
                    )
                  }
                >
                  <FaEye className="text-xs" />
                  Join
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm border border-gray-200 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleUpdateClick(m._id)}
                  title="Edit Meeting"
                >
                  <FaEdit className="text-xs" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMeetings;
