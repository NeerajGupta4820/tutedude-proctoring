import React, { useRef, useEffect, useCallback, useState } from 'react';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import ScrollToBottom from './ScrollToBottom';

const ChatMessages = ({
  messages,
  isLoading,
  isLoadingMessages,
  onSendMessage,
}) => {
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isNearBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return true;
    const threshold = 150;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  }, []);

  const handleScroll = useCallback(() => {
    const nearBottom = isNearBottom();
    setIsUserScrolledUp(!nearBottom);
    setShowScrollButton(!nearBottom && messages.length > 0);
  }, [isNearBottom, messages.length]);

  const scrollToBottom = useCallback(
    (force = false) => {
      if (force || !isUserScrolledUp) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
        setIsUserScrolledUp(false);
      }
    },
    [isUserScrolledUp]
  );

  useEffect(() => {
    if (!isUserScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isUserScrolledUp]);

  return (
    <div className="relative h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Scrollable container */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        {/* Loading messages from DB */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-7 h-7 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500 font-medium">Loading conversations...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen onSendMessage={onSendMessage} />
        ) : (
          <div className="space-y-5 max-w-5xl mx-auto px-6 py-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing Indicator */}
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3 items-start animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl rounded-tl-lg px-5 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 ml-1">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll Button */}
      <ScrollToBottom
        show={showScrollButton}
        onClick={() => scrollToBottom(true)}
      />
    </div>
  );
};

export default ChatMessages;
