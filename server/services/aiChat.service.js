// services/aiChat.service.js
import AIConversation from '../models/AIConversation.js';
import AIMessage from '../models/AIMessage.js';

class AIChatService {
  // ==========================================
  // CONVERSATION METHODS
  // ==========================================

  // Create new conversation
  async createConversation(userId, title = 'New Conversation') {
    const conversation = await AIConversation.create({
      user: userId,
      title,
    });
    return conversation;
  }

  // Get all conversations for a user
  async getUserConversations(userId, { page = 1, limit = 20, search = '' }) {
    const query = {
      user: userId,
      isDeleted: false,
    };

    // Search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const conversations = await AIConversation.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AIConversation.countDocuments(query);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get single conversation
  async getConversationById(conversationId, userId) {
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: userId,
      isDeleted: false,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  // Update conversation title
  async updateTitle(conversationId, userId, title) {
    const conversation = await AIConversation.findOneAndUpdate(
      { _id: conversationId, user: userId, isDeleted: false },
      { title },
      { new: true }
    );

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  // Toggle pin conversation
  async togglePin(conversationId, userId) {
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: userId,
      isDeleted: false,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.isPinned = !conversation.isPinned;
    await conversation.save();

    return conversation;
  }

  // Soft delete conversation
  async deleteConversation(conversationId, userId) {
    const conversation = await AIConversation.findOneAndUpdate(
      { _id: conversationId, user: userId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'deleted',
      },
      { new: true }
    );

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Soft delete all messages in this conversation
    await AIMessage.updateMany(
      { conversation: conversationId },
      { isDeleted: true }
    );

    return conversation;
  }

  // Clear all messages in conversation (keep conversation)
  async clearConversation(conversationId, userId) {
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: userId,
      isDeleted: false,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Soft delete all messages
    await AIMessage.updateMany(
      { conversation: conversationId },
      { isDeleted: true }
    );

    // Reset conversation stats
    conversation.messageCount = 0;
    conversation.lastMessage = {
      content: '',
      role: 'user',
      timestamp: new Date(),
    };
    await conversation.save();

    return conversation;
  }

  // ==========================================
  // MESSAGE METHODS
  // ==========================================

  // Save a message (user or assistant)
  async saveMessage(conversationId, messageData) {
    const message = await AIMessage.create({
      conversation: conversationId,
      role: messageData.role,
      content: messageData.content,
      model: messageData.model || 'llama3.2',
      responseTime: messageData.responseTime || null,
      isError: messageData.isError || false,
      tokenUsage: messageData.tokenUsage || null,
    });

    // Update conversation's last message and count
    await AIConversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content:
          messageData.content.substring(0, 100) +
          (messageData.content.length > 100 ? '...' : ''),
        role: messageData.role,
        timestamp: new Date(),
      },
      $inc: { messageCount: 1 },
    });

    return message;
  }

  // Get messages for a conversation (with pagination)
  async getMessages(conversationId, userId, { page = 1, limit = 50 }) {
    // Verify conversation belongs to user
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: userId,
      isDeleted: false,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const skip = (page - 1) * limit;

    const messages = await AIMessage.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AIMessage.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Delete a single message
  async deleteMessage(messageId, userId) {
    // Find message and verify ownership through conversation
    const message = await AIMessage.findById(messageId).populate({
      path: 'conversation',
      select: 'user',
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.conversation.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    message.isDeleted = true;
    await message.save();

    // Update conversation message count
    await AIConversation.findByIdAndUpdate(message.conversation._id, {
      $inc: { messageCount: -1 },
    });

    return message;
  }

  // Add feedback to a message (like/dislike)
  async addFeedback(messageId, userId, feedbackData) {
    const message = await AIMessage.findById(messageId).populate({
      path: 'conversation',
      select: 'user',
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.conversation.user.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    if (message.role !== 'assistant') {
      throw new Error('Can only give feedback on AI messages');
    }

    message.feedback = {
      type: feedbackData.type, // 'like' or 'dislike'
      comment: feedbackData.comment || '',
      feedbackAt: new Date(),
    };

    await message.save();
    return message;
  }

  // ==========================================
  // AUTO TITLE GENERATION
  // ==========================================

  // Generate title from first message
  generateTitle(firstMessage) {
    const content = firstMessage.trim();

    // Take first 50 chars or first sentence
    const firstSentence = content.split(/[.?!\n]/)[0];

    if (firstSentence.length <= 50) {
      return firstSentence;
    }

    return content.substring(0, 47) + '...';
  }
}

export default new AIChatService();
