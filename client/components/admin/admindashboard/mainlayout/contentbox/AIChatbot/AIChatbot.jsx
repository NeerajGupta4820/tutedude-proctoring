import React, { useState, useCallback } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import useAIChatSocket from './useAIChatSocket';
import useConversations from './useConversations';

const AIChatbot = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    isLoadingConversations,
    isLoadingMessages,
    createConversation,
    selectConversation,
    updateTitle,
    togglePin,
    deleteConversation,
    clearConversation,
    searchConversations,
    updateConversationLastMessage,
  } = useConversations();

  const onChunk = useCallback(
    (chunk) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return prev.map((msg, idx) =>
            idx === prev.length - 1
              ? { ...msg, content: msg.content + chunk }
              : msg
          );
        }
        return prev;
      });
    },
    [setMessages]
  );

  const onDone = useCallback(() => {
    setIsLoading(false);
    setMessages((prev) => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.role === 'assistant') {
        updateConversationLastMessage(lastMsg.content, 'assistant');
      }
      return prev;
    });
  }, [setMessages, updateConversationLastMessage]);

  const onError = useCallback(
    (message) => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === '') {
          return prev.map((msg, idx) =>
            idx === prev.length - 1
              ? { ...msg, content: `❌ ${message}`, isError: true }
              : msg
          );
        }
        return [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            content: `❌ ${message}`,
            timestamp: new Date(),
            isError: true,
          },
        ];
      });
      setIsLoading(false);
    },
    [setMessages]
  );

  const { sendMessage } = useAIChatSocket({ onChunk, onDone, onError });

  const handleSendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isLoading) return;

      const trimmedText = text.trim();

      let currentConversation = activeConversation;
      if (!currentConversation) {
        try {
          const title =
            trimmedText.length > 40
              ? trimmedText.substring(0, 37) + '...'
              : trimmedText;
          currentConversation = await createConversation(title);
        } catch (error) {
          currentConversation = {
            _id: `temp_${Date.now()}`,
            title: trimmedText.substring(0, 40),
          };
          setActiveConversation(currentConversation);
        }
      }

      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: trimmedText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);
      updateConversationLastMessage(trimmedText, 'user');

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      sendMessage(trimmedText, conversationHistory, currentConversation?._id);
    },
    [
      isLoading,
      activeConversation,
      messages,
      createConversation,
      setMessages,
      sendMessage,
      updateConversationLastMessage,
      setActiveConversation,
    ]
  );

  const handleNewChat = useCallback(async () => {
    await createConversation();
  }, [createConversation]);

  const handleClearChat = useCallback(() => {
    if (activeConversation) {
      clearConversation(activeConversation._id);
    }
    setMessages([]);
  }, [activeConversation, clearConversation, setMessages]);

  return (
    <div
      className={`flex ${
        isExpanded
          ? 'fixed inset-0 z-50 bg-gray-50 p-4'
          : 'h-[calc(100vh-140px)]'
      }`}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-72 flex-shrink-0 bg-white rounded-l-2xl border-2 border-dashed border-gray-200 overflow-hidden">
          <ChatSidebar
            conversations={conversations}
            activeConversation={activeConversation}
            isLoading={isLoadingConversations}
            onNewChat={handleNewChat}
            onSelectConversation={selectConversation}
            onDeleteConversation={deleteConversation}
            onTogglePin={togglePin}
            onUpdateTitle={updateTitle}
            onSearch={searchConversations}
            onCloseSidebar={() => setShowSidebar(false)}
            isMobile={false}
          />
        </div>
      )}

      {/* Main Chat Area - Fixed layout */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-white overflow-hidden ${
          showSidebar ? 'rounded-r-2xl' : 'rounded-2xl'
        } border-2 border-dashed border-gray-200 shadow-lg`}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <ChatHeader
            title={activeConversation?.title}
            isExpanded={isExpanded}
            onClearChat={handleClearChat}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
          />
        </div>

        {/* Scrollable Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Fixed Input */}
        <div className="flex-shrink-0">
          <ChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={(text) => handleSendMessage(text)}
            isLoading={isLoading}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;
