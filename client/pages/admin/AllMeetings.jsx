import React from 'react';

const AllMeetings = ({ meetings, navigate }) => {
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center text-gray-500">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl font-semibold">No Meetings Found</p>
          <p className="mt-2">Create your first meeting to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          All Meetings ({meetings.length})
        </h2>
        <p className="text-gray-600 mt-1">Complete list of all scheduled interviews</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Round
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attended
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Result
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meetings.map(m => (
              <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                {/* Candidate */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{m.user?.name}</div>
                      <div className="text-sm text-gray-500">{m.user?.email}</div>
                    </div>
                  </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {new Date(m.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-cyan-600 font-bold">{m.time}</div>
                </td>

                {/* Job Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{m.jobRole}</div>
                </td>

                {/* Round */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-cyan-100 text-cyan-800">
                    {m.round}
                  </span>
                </td>

                {/* Attended */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    m.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {m.attended ? '✓ Yes' : '✗ No'}
                  </span>
                </td>

                {/* Result */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    m.result === 'pass' ? 'bg-green-100 text-green-800' :
                    m.result === 'fail' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {m.result === 'pass' ? '✓ Pass' : 
                     m.result === 'fail' ? '✗ Fail' : 
                     '⏳ Pending'}
                  </span>
                </td>

                {/* Rating */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {m.rating ? (
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-lg mr-1">★</span>
                      <span className="text-sm font-bold text-gray-900">{m.rating}/10</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      className="text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors font-semibold text-xs"
                      onClick={() => navigate(`/interview?meetingId=${m._id}&admin=1`)}
                      title="Join Meeting"
                    >
                      Join
                    </button>
                    <button
                      className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-semibold text-xs"
                      onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                      title="Update Meeting"
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-semibold">Total Meetings</p>
          <p className="text-2xl font-bold text-blue-700">{meetings.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-semibold">Attended</p>
          <p className="text-2xl font-bold text-green-700">
            {meetings.filter(m => m.attended).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-semibold">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">
            {meetings.filter(m => !m.attended).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-semibold">Pass Rate</p>
          <p className="text-2xl font-bold text-purple-700">
            {meetings.filter(m => m.attended).length > 0 
              ? Math.round((meetings.filter(m => m.result === 'pass').length / meetings.filter(m => m.attended).length) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllMeetings;