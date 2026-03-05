import aiChatService from '../services/aiChat.service.js';

// ==========================================
// CONVERSATION CONTROLLERS
// ==========================================

export const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await aiChatService.getUserConversations(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(req.user);
    const { title } = req.body;

    const conversation = await aiChatService.createConversation(userId, title);

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const searchConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q = '', page = 1, limit = 20 } = req.query;

    const result = await aiChatService.getUserConversations(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search: q,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateConversationTitle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const conversation = await aiChatService.updateTitle(
      id,
      userId,
      title.trim()
    );

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const togglePinConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await aiChatService.togglePin(id, userId);

    res.status(200).json({
      success: true,
      conversation,
      message: conversation.isPinned
        ? 'Conversation pinned'
        : 'Conversation unpinned',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await aiChatService.deleteConversation(id, userId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const clearConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await aiChatService.clearConversation(id, userId);

    res.status(200).json({
      success: true,
      conversation,
      message: 'Conversation cleared',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MESSAGE CONTROLLERS
// ==========================================

export const getConversationMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await aiChatService.getMessages(id, userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    await aiChatService.deleteMessage(messageId, userId);

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const messageFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { type, comment } = req.body;

    if (!type || !['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type must be "like" or "dislike"',
      });
    }

    const message = await aiChatService.addFeedback(messageId, userId, {
      type,
      comment,
    });

    res.status(200).json({
      success: true,
      message: 'Feedback saved',
      feedback: message.feedback,
    });
  } catch (error) {
    next(error);
  }
};
