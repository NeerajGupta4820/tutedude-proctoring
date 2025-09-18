import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [form, setForm] = useState({ userId: '', date: '', time: '', jobRole: '', round: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/');
    } else {
      setCheckingRole(false);
    }
  }, [user, navigate]);

  // Fetch users and meetings
  useEffect(() => {
    if (checkingRole) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const usersRes = await axios.get('http://localhost:5000/api/meeting/users', { headers: { Authorization: `Bearer ${token}` } });
        setUsers(usersRes.data.filter(u => u.role === 'user'));
        const meetingsRes = await axios.get('http://localhost:5000/api/meeting', { headers: { Authorization: `Bearer ${token}` } });
        setMeetings(meetingsRes.data);
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, [checkingRole]);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Schedule meeting
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/meeting', form, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Meeting scheduled!');
      setForm({ userId: '', date: '', time: '', jobRole: '', round: '' });
      // Refresh meetings
      const meetingsRes = await axios.get('http://localhost:5000/api/meeting', { headers: { Authorization: `Bearer ${token}` } });
      setMeetings(meetingsRes.data);
    } catch (err) {
      setError('Failed to schedule meeting');
    }
    setLoading(false);
  };

  if (checkingRole) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-700">Admin Dashboard</h1>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Schedule Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">User Email</label>
            <select name="userId" value={form.userId} onChange={handleChange} className="border rounded p-2 w-full" required>
              <option value="">Select user</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.email}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="border rounded p-2 w-full" required />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Time</label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className="border rounded p-2 w-full" required />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Job Role</label>
              <input type="text" name="jobRole" value={form.jobRole} onChange={handleChange} className="border rounded p-2 w-full" required />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Interview Round</label>
              <input type="text" name="round" value={form.round} onChange={handleChange} className="border rounded p-2 w-full" required />
            </div>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button type="submit" className="bg-cyan-700 text-white px-6 py-2 rounded font-semibold" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">All Meetings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-cyan-100">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Job Role</th>
                <th className="p-2 border">Round</th>
                <th className="p-2 border">Attended</th>
                <th className="p-2 border">Result</th>
                <th className="p-2 border">Rating</th>
                <th className="p-2 border">Review</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(m => (
                <tr key={m._id} className="text-center">
                  <td className="p-2 border">{m.user?.name}</td>
                  <td className="p-2 border">{m.user?.email}</td>
                  <td className="p-2 border">{m.date?.slice(0,10)}</td>
                  <td className="p-2 border">{m.time}</td>
                  <td className="p-2 border">{m.jobRole}</td>
                  <td className="p-2 border">{m.round}</td>
                  <td className="p-2 border">{m.attended ? 'Yes' : 'No'}</td>
                  <td className="p-2 border">{m.result}</td>
                  <td className="p-2 border">{m.rating || '-'}</td>
                  <td className="p-2 border">{m.review || '-'}</td>
                  <td className="p-2 border flex flex-col gap-2 items-center">
                    <button
                      className="bg-cyan-700 text-white px-2 py-1 rounded text-xs mb-1"
                      onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                    >
                      Update
                    </button>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => navigate(`/interview?meetingId=${m._id}&admin=1`)}
                    >
                      Join as Interviewer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meeting Cards for Admin to Join */}
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Join Meeting as Interviewer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map(m => (
            <div key={m._id} className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm">
              <div><span className="font-semibold">User:</span> {m.user?.name} ({m.user?.email})</div>
              <div><span className="font-semibold">Date:</span> {m.date?.slice(0,10)}</div>
              <div><span className="font-semibold">Time:</span> {m.time}</div>
              <div><span className="font-semibold">Job Role:</span> {m.jobRole}</div>
              <div><span className="font-semibold">Round:</span> {m.round}</div>
              <button
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
                onClick={() => navigate(`/interview?meetingId=${m._id}&admin=1`)}
              >
                Join as Interviewer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
