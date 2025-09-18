import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AdminEndMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ rating: '', review: '', result: 'pending', attended: false });
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
        setMeeting(res.data);
        setForm({
          rating: res.data.rating || '',
          review: res.data.review || '',
          result: res.data.result || 'pending',
          attended: res.data.attended || false,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch meeting details');
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
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
      await axios.patch(`http://localhost:5000/api/meeting/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Meeting updated successfully!');
      setTimeout(() => navigate('/dashboard'), 2000); // Redirect to dashboard after success
    } catch (err) {
      setError('Failed to update meeting');
    }
    setUpdateLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  if (!meeting) return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-cyan-700">End Meeting & Update Record</h1>
        <div className="mb-4">
          <div><strong>User:</strong> {meeting.user?.name || 'Unknown'}</div>
          <div><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</div>
          <div><strong>Job Role:</strong> {meeting.jobRole}</div>
          <div><strong>Round:</strong> {meeting.round}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Rating (0-10)</label>
            <input
              type="number"
              name="rating"
              min="0"
              max="10"
              value={form.rating}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Review</label>
            <textarea
              name="review"
              value={form.review}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Result</label>
            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            >
              <option value="pending">Pending</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Attended</label>
            <input
              type="checkbox"
              name="attended"
              checked={form.attended}
              onChange={handleChange}
              className="border rounded p-2"
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button
            type="submit"
            className="bg-cyan-700 text-white px-6 py-2 rounded font-semibold"
            disabled={updateLoading}
            onClick={() => navigate('/dashboard') }
          >
            {updateLoading ? 'Saving...' : 'Save & End Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEndMeeting;