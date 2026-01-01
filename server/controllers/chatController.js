// controllers/chatController.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, PaginatedResponse } from '../utils/response.js';
import chatService from '../services/chat.service.js';

// Get all chats for a meeting
export const getChatsByMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
  };

  const { chats, pagination } = await chatService.getChatsByMeeting(
    meetingId,
    options
  );

  res.json(
    new PaginatedResponse(200, chats, pagination, 'Chats fetched successfully')
  );
});

// Get chats by roomId
export const getChatsByRoomId = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const options = { limit: parseInt(req.query.limit) || 100 };

  const chats = await chatService.getChatsByRoomId(roomId, options);

  res.json(new ApiResponse(200, chats, 'Chats fetched successfully'));
});

// Send message via HTTP (fallback - socket is primary)
export const sendMessage = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { message, messageType, codeSnippet, attachment } = req.body;

  const userType = req.user.role === 'candidate' ? 'Candidate' : 'User';

  const messageData = {
    meeting: meetingId,
    sender: {
      userId: req.user._id || req.user.id,
      userType,
      name: req.user.name,
      avatar: req.user.avatar,
    },
    message,
    messageType,
    codeSnippet,
    attachment,
  };

  const chat = await chatService.saveMessage(messageData);

  res.status(201).json(new ApiResponse(201, chat, 'Message sent successfully'));
});

// Delete a message
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id || req.user.id;

  const chat = await chatService.deleteMessage(messageId, userId);

  res.json(new ApiResponse(200, chat, 'Message deleted successfully'));
});

// Delete all chats for a meeting
export const deleteAllChats = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { hardDelete } = req.query;

  const result = await chatService.deleteAllChatsByMeeting(
    meetingId,
    hardDelete === 'true'
  );

  res.json(new ApiResponse(200, result, 'Chats deleted successfully'));
});

// Get chat statistics
export const getChatStats = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  const stats = await chatService.getChatStats(meetingId);

  res.json(new ApiResponse(200, stats, 'Chat stats fetched successfully'));
});

// Mark messages as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user._id || req.user.id;

  await chatService.markAsRead(meetingId, userId);

  res.json(new ApiResponse(200, null, 'Messages marked as read'));
});

export default {
  getChatsByMeeting,
  getChatsByRoomId,
  sendMessage,
  deleteMessage,
  deleteAllChats,
  getChatStats,
  markAsRead,
};
