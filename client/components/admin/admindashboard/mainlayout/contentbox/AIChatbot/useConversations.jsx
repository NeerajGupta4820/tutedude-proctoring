// components/AIChatbot/useConversations.js
import { useState, useCallback, useEffect } from 'react';
import { aiChatApi } from '../../../../../../services/api';

const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const data = await aiChatApi.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Create new conversation
  const createConversation = useCallback(async (title = 'New Conversation') => {
    try {
      const data = await aiChatApi.createConversation(title);
      const newConv = data.conversation;
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }, []);

  // Select a conversation and load its messages
  const selectConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation);
    setIsLoadingMessages(true);
    try {
      const data = await aiChatApi.getMessages(conversation._id);
      const loadedMessages = (data.messages || []).map((msg) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        isError: msg.isError || false,
      }));
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Update title
  const updateTitle = useCallback(async (conversationId, title) => {
    try {
      await aiChatApi.updateTitle(conversationId, title);
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, title } : c))
      );
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  }, []);

  // Toggle pin
  const togglePin = useCallback(async (conversationId) => {
    try {
      const data = await aiChatApi.togglePin(conversationId);
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === conversationId
              ? { ...c, isPinned: data.conversation.isPinned }
              : c
          )
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          })
      );
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(
    async (conversationId) => {
      try {
        await aiChatApi.deleteConversation(conversationId);
        setConversations((prev) =>
          prev.filter((c) => c._id !== conversationId)
        );

        // If deleted conversation was active, clear it
        if (activeConversation?._id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    },
    [activeConversation]
  );

  // Clear conversation messages
  const clearConversation = useCallback(
    async (conversationId) => {
      try {
        await aiChatApi.clearConversation(conversationId);
        if (activeConversation?._id === conversationId) {
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to clear conversation:', error);
      }
    },
    [activeConversation]
  );

  // Search conversations
  const searchConversations = useCallback(
    async (query) => {
      if (!query.trim()) {
        fetchConversations();
        return;
      }
      try {
        const data = await aiChatApi.searchConversations(query);
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Failed to search:', error);
      }
    },
    [fetchConversations]
  );

  // Update last message in conversation list
  const updateConversationLastMessage = useCallback(
    (content, role) => {
      if (!activeConversation) return;
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? {
                ...c,
                lastMessage: {
                  content: content.substring(0, 100),
                  role,
                  timestamp: new Date(),
                },
                updatedAt: new Date(),
              }
            : c
        )
      );
    },
    [activeConversation]
  );

  return {
    conversations,
    activeConversation,
    messages,
    setMessages,
    isLoadingConversations,
    isLoadingMessages,
    fetchConversations,
    createConversation,
    selectConversation,
    updateTitle,
    togglePin,
    deleteConversation,
    clearConversation,
    searchConversations,
    updateConversationLastMessage,
  };
};

export default useConversations;
