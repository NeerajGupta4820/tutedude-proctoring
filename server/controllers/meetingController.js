import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, PaginatedResponse } from '../utils/response.js';
import meetingService from '../services/meeting.service.js';
import User from '../models/User.js';

export const createMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.createMeeting(req.body);
  res.status(201).json(new ApiResponse(201, meeting, 'Meeting created successfully'));
});

export const getAllMeetings = asyncHandler(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 100,
    sort: req.query.sort || '-scheduledDate',
    status: req.query.status,
    userId: req.query.userId,
  };

  const { meetings, pagination } = await meetingService.getAllMeetings(options);
  res.json(new PaginatedResponse(200, meetings, pagination, 'Meetings fetched successfully'));
});

export const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.getMeetingById(req.params.id);
  res.json(new ApiResponse(200, meeting, 'Meeting fetched successfully'));
});

export const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.updateMeeting(req.params.id, req.body);
  res.json(new ApiResponse(200, meeting, 'Meeting updated successfully'));
});

export const getNextMeeting = asyncHandler(async (req, res) => {
  const meeting = await meetingService.getNextMeeting(req.user.id);
  res.json(new ApiResponse(200, meeting, 'Next meeting fetched successfully'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } })
    .select('name email role')
    .sort({ name: 1 })
    .lean();
  res.json(new ApiResponse(200, users, 'Users fetched successfully'));
});

// Editor state management
const editorStateStore = new Map();

export const getEditorState = asyncHandler(async (req, res) => {
  const meetingId = req.params.id;
  const state = editorStateStore.get(meetingId) || {
    isOpen: false,
    language: 'javascript',
  };
  res.json(new ApiResponse(200, state));
});

export const setEditorState = asyncHandler(async (req, res) => {
  const meetingId = req.params.id;
  const { isOpen, language } = req.body;
  const state = {
    isOpen: isOpen !== undefined ? isOpen : false,
    language: language || 'javascript',
  };
  editorStateStore.set(meetingId, state);
  res.json(new ApiResponse(200, state));
});

export default {
  createMeeting,
  getAllMeetings,
  getMeeting,
  updateMeeting,
  getNextMeeting,
  getAllUsers,
  getEditorState,
  setEditorState,
};