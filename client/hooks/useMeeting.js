import { useState, useEffect } from 'react';
import axios from 'axios';

const useMeeting = (meetingId) => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/meeting/${meetingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMeeting(response.data.data || response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load meeting');
        setLoading(false);
      }
    };

    if (meetingId && meetingId !== 'default_meeting') {
      fetchMeeting();
    } else {
      setLoading(false);
    }
  }, [meetingId]);

  return { meeting, loading, error };
};

export default useMeeting;