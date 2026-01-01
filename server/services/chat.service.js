// services/chat.service.js
import Chat from '../models/ChatSchema.js';
import Meeting from '../models/MeetingSchema.js';
import { ApiError } from '../utils/response.js';

class ChatService {
  // Get chats by roomId (used by frontend)
  async getChatsByRoomId(roomId, options = {}) {
    const { limit = 100 } = options;

    const chats = await Chat.find({
      roomId: roomId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .lean();

    return chats;
  }

  // Get all chats for a meeting by MongoDB ObjectId
  async getChatsByMeeting(meetingId, options = {}) {
    const { page = 1, limit = 50 } = options;

    // Check if meetingId is valid ObjectId
    if (!meetingId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError(400, 'Invalid meeting ID format');
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new ApiError(404, 'Meeting not found');
    }

    const chats = await Chat.find({
      meeting: meetingId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Chat.countDocuments({
      meeting: meetingId,
      isDeleted: false,
    });

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
      hasMore: page * limit < total,
    };

    return { chats, pagination };
  }

  // Save new message
  async saveMessage(messageData) {
    const {
      meeting,
      roomId,
      sender,
      message,
      messageType,
      codeSnippet,
      attachment,
    } = messageData;

    // Find meeting by roomId if meeting ObjectId not provided
    let meetingDoc = null;
    let meetingObjectId = meeting;

    if (roomId) {
      meetingDoc = await Meeting.findOne({ roomId: roomId });
      if (meetingDoc) {
        meetingObjectId = meetingDoc._id;
      }
    }

    // If still no meeting found, just use roomId for chat storage
    const chat = await Chat.create({
      meeting: meetingObjectId || null,
      roomId: roomId,
      sender,
      message,
      messageType: messageType || 'text',
      codeSnippet,
      attachment,
    });

    return chat;
  }

  // Delete single message
  async deleteMessage(messageId, userId) {
    const chat = await Chat.findById(messageId);

    if (!chat) {
      throw new ApiError(404, 'Message not found');
    }

    if (chat.sender.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only delete your own messages');
    }

    chat.isDeleted = true;
    chat.deletedAt = new Date();
    await chat.save();

    return chat;
  }

  // Delete all chats by roomId
  async deleteAllChatsByRoomId(roomId, hardDelete = false) {
    if (hardDelete) {
      const result = await Chat.deleteMany({ roomId: roomId });
      return { deletedCount: result.deletedCount };
    }

    const result = await Chat.updateMany(
      { roomId: roomId },
      { isDeleted: true, deletedAt: new Date() }
    );
    return { modifiedCount: result.modifiedCount };
  }

  // Delete all chats for a meeting
  async deleteAllChatsByMeeting(meetingId, hardDelete = false) {
    if (hardDelete) {
      const result = await Chat.deleteMany({ meeting: meetingId });
      return { deletedCount: result.deletedCount };
    }

    const result = await Chat.updateMany(
      { meeting: meetingId },
      { isDeleted: true, deletedAt: new Date() }
    );
    return { modifiedCount: result.modifiedCount };
  }

  // Get chat stats
  async getChatStats(roomId) {
    const stats = await Chat.aggregate([
      { $match: { roomId: roomId, isDeleted: false } },
      { $group: { _id: '$sender.userType', count: { $sum: 1 } } },
    ]);

    const totalMessages = await Chat.countDocuments({
      roomId: roomId,
      isDeleted: false,
    });

    return { totalMessages, byUserType: stats };
  }

  // Mark messages as read
  async markAsRead(roomId, userId) {
    await Chat.updateMany(
      {
        roomId: roomId,
        'readBy.userId': { $ne: userId },
      },
      {
        $push: {
          readBy: { userId, readAt: new Date() },
        },
      }
    );

    return true;
  }
}

export default new ChatService();
