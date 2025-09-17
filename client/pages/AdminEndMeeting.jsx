import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEndMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [form, setForm] = useState({ rating: '', review: '', result: 'pending', attended: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/meeting', { headers: { Authorization: `Bearer ${token}` } });
        const m = res.data.find(mt => mt._id === id);
        setMeeting(m);
        setForm({
          rating: m?.rating || '',
          review: m?.review || '',
          result: m?.result || 'pending',
          attended: true
        });
      } catch {
        setError('Failed to fetch meeting');
      }
    };
    fetchMeeting();
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/meeting/${id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Meeting updated!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch {
      setError('Failed to update meeting');
    }
    setLoading(false);
  };

  if (!meeting) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-cyan-700">End Meeting & Update Record</h1>
        <div className="mb-4">
          <div><b>User:</b> {meeting.user?.name} ({meeting.user?.email})</div>
          <div><b>Date:</b> {meeting.date?.slice(0,10)} <b>Time:</b> {meeting.time}</div>
          <div><b>Job Role:</b> {meeting.jobRole} <b>Round:</b> {meeting.round}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Rating (1-5)</label>
            <input type="number" name="rating" min="1" max="5" value={form.rating} onChange={handleChange} className="border rounded p-2 w-full" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Review</label>
            <textarea name="review" value={form.review} onChange={handleChange} className="border rounded p-2 w-full" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Result</label>
            <select name="result" value={form.result} onChange={handleChange} className="border rounded p-2 w-full">
              <option value="pending">Pending</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button type="submit" className="bg-cyan-700 text-white px-6 py-2 rounded font-semibold" disabled={loading}>
            {loading ? 'Saving...' : 'Save & End Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEndMeeting;
