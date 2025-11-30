import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const InterviewerManagement = ({ onUpdate }) => {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/interviewer/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviewers(res.data.data);
    } catch (err) {
      setError('Failed to fetch interviewers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interviewer?'))
      return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/interviewer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInterviewers();
      onUpdate();
    } catch (err) {
      setError('Failed to delete interviewer');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Loading interviewers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviewers.length > 0 ? (
                interviewers.map((interviewer) => (
                  <tr key={interviewer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {interviewer.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interviewer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {interviewer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interviewer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => alert('Edit feature coming soon')}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(interviewer._id)}
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
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No interviewers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Total Interviewers:{' '}
          <span className="font-semibold">{interviewers.length}</span>
        </p>
      </div>
    </div>
  );
};

export default InterviewerManagement;
