import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaStar,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaBriefcase,
  FaLayerGroup,
  FaCalendarAlt,
  FaSpinner,
  FaHome,
} from 'react-icons/fa';

const AdminEndMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rating: '',
    review: '',
    result: 'pending',
    attended: false,
  });
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/meeting/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Handle both response formats
        const meetingData = res.data.data || res.data;
        setMeeting(meetingData);
        setForm({
          rating: meetingData.rating || '',
          review: meetingData.review || '',
          result: meetingData.result || 'pending',
          attended: meetingData.attended || false,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError(
          err.response?.data?.message || 'Failed to fetch meeting details'
        );
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/meeting/${id}`,
        {
          ...form,
          status: 'completed',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Meeting updated successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meeting');
    }
    setUpdateLoading(false);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <FaTimes className="text-4xl text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleGoToDashboard}
            className="bg-cyan-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 mx-auto"
          >
            <FaHome />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get candidate name safely
  const getCandidateName = () => {
    if (meeting?.candidate?.name) return meeting.candidate.name;
    if (meeting?.user?.name) return meeting.user.name;
    return 'Unknown';
  };

  // Get date safely
  const getMeetingDate = () => {
    const dateValue = meeting?.scheduledDate || meeting?.date;
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString();
  };

  // Get job role safely
  const getJobRole = () => {
    return meeting?.interviewConfig?.jobRole || meeting?.jobRole || 'N/A';
  };

  // Get round safely
  const getRound = () => {
    return meeting?.interviewConfig?.round || meeting?.round || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-cyan-700 shadow-lg px-4 py-3">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link
            to="/dashboard"
            className="text-white flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition"
          >
            <FaArrowLeft />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold text-white">End Meeting</h1>
          <button
            onClick={handleGoToDashboard}
            className="text-white flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition"
          >
            <FaHome />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-cyan-700 flex items-center gap-2">
            <FaCheck className="text-green-500" />
            End Meeting & Update Record
          </h2>

          {/* Meeting Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <FaUser className="text-cyan-600" />
              <strong>Candidate:</strong>
              <span>{getCandidateName()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-cyan-600" />
              <strong>Date:</strong>
              <span>{getMeetingDate()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBriefcase className="text-cyan-600" />
              <strong>Job Role:</strong>
              <span>{getJobRole()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-cyan-600" />
              <strong>Round:</strong>
              <span>{getRound()}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block font-medium mb-2 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                Rating (0-10)
              </label>
              <input
                type="number"
                name="rating"
                min="0"
                max="10"
                value={form.rating}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter rating..."
              />
            </div>

            {/* Review */}
            <div>
              <label className="block font-medium mb-2">
                Review / Feedback
              </label>
              <textarea
                name="review"
                value={form.review}
                onChange={handleChange}
                rows={4}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your review..."
              />
            </div>

            {/* Result */}
            <div>
              <label className="block font-medium mb-2">Result</label>
              <select
                name="result"
                value={form.result}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>

            {/* Attended */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="attended"
                id="attended"
                checked={form.attended}
                onChange={handleChange}
                className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="attended" className="font-medium cursor-pointer">
                Candidate Attended
              </label>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2">
                <FaTimes />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg flex items-center gap-2">
                <FaCheck />
                {success}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <FaHome />
                Dashboard
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="flex-1 bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updateLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Save & End
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminEndMeeting;
