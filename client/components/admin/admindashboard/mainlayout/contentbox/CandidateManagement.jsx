import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiEdit2, FiDownload, FiCheck, FiX } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const CandidateManagement = ({ candidates, onUpdate }) => {
  const [filteredCandidates, setFilteredCandidates] = useState(candidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');

  useEffect(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (filterExperience !== 'all') {
      filtered = filtered.filter((c) => c.experience === filterExperience);
    }

    setFilteredCandidates(filtered);
  }, [searchTerm, filterStatus, filterExperience, candidates]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?'))
      return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/candidate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      alert('Failed to delete candidate');
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/candidate/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Candidate approved successfully!');
      onUpdate();
    } catch (err) {
      console.error('Failed to approve candidate:', err);
      alert('Failed to approve candidate');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/candidate/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Candidate rejected');
      onUpdate();
    } catch (err) {
      console.error('Failed to reject candidate:', err);
      alert('Failed to reject candidate');
    }
  };

  const downloadResume = (resumePath) => {
    if (resumePath) {
      window.open(`http://localhost:5000/${resumePath}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Filter Candidates</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterExperience('all');
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {candidate.photo && (
                          <img
                            src={`http://localhost:5000/${candidate.photo}`}
                            alt={candidate.name}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {candidate.experience}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          candidate.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : candidate.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : candidate.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          candidate.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {candidate.isApproved ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 flex-wrap">
                        {candidate.resume && (
                          <button
                            onClick={() => downloadResume(candidate.resume)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Resume"
                          >
                            <FiDownload size={18} />
                          </button>
                        )}
                        {!candidate.isApproved && (
                          <button
                            onClick={() => handleApprove(candidate._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                        {candidate.isApproved && (
                          <button
                            onClick={() => handleReject(candidate._id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Reject"
                          >
                            <FiX size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => alert('Edit feature coming soon')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(candidate._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Total Candidates:{' '}
          <span className="font-semibold">{filteredCandidates.length}</span> /
          <span className="font-semibold ml-1">{candidates.length}</span>
        </p>
      </div>
    </div>
  );
};

export default CandidateManagement;
