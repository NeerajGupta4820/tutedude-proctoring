import Meeting from '../models/Meeting.js';
import User from '../models/User.js';

// Admin: Create a meeting
export const createMeeting = async (req, res) => {
  try {
    const { userId, date, time, jobRole, round } = req.body;

    // Input validation
    if (!userId || !date || !time || !jobRole || !round) {
      return res.status(400).json({ message: 'All fields (userId, date, time, jobRole, round) are required' });
    }

    // Validate userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate date
    const meetingDate = new Date(date);
    if (isNaN(meetingDate) || meetingDate < new Date()) {
      return res.status(400).json({ message: 'Invalid or past date' });
    }

    // Validate time (assuming time is a string like "14:30")
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24-hour)' });
    }

    const meeting = await Meeting.create({ user: userId, date: meetingDate, time, jobRole, round });
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create meeting', error: error.message });
  }
};

// Admin: Get all meetings
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().populate('user', 'name email').sort({ date: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings', error: error.message });
  }
};

export const getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);
    res.json(meeting);  
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings', error: error.message });
  }
};

// Admin: Update meeting (rating, review, result, attended)
export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, result, attended } = req.body;

    // Validate inputs
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
      return res.status(400).json({ message: 'Rating must be a number between 0 and 10' });
    }
    if (result !== undefined && !['pass', 'fail', 'pending'].includes(result)) {
      return res.status(400).json({ message: 'Result must be "pass", "fail", or "pending"' });
    }
    if (attended !== undefined && typeof attended !== 'boolean') {
      return res.status(400).json({ message: 'Attended must be a boolean' });
    }

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { rating, review, result, attended },
      { new: true, runValidators: true }
    );
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update meeting', error: error.message });
  }
};

// User: Get next meeting (not attended, date >= now)
export const getNextMeeting = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const meeting = await Meeting.findOne({
      user: userId,
      attended: false,
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .populate('user', 'name email');
    if (!meeting) {
      return res.status(404).json({ message: 'No upcoming meetings found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch next meeting', error: error.message });
  }
};

// Admin: Get all users (for dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// In-memory store for code editor visibility per meeting
const editorOpenStore = {};

// Set code editor open status for a meeting
export const setEditorOpen = (req, res) => {
  const meetingId = req.params.id;
  const { open } = req.body;
  editorOpenStore[meetingId] = !!open;
  res.json({ meetingId, open: editorOpenStore[meetingId] });
};

// Get code editor open status for a meeting
export const getEditorOpen = (req, res) => {
  const meetingId = req.params.id;
  res.json({ meetingId, open: !!editorOpenStore[meetingId] });
};
export default {
  createMeeting,
  getAllMeetings,
  updateMeeting,
  getNextMeeting,
  getAllUsers,
  getMeeting,
  setEditorOpen
};