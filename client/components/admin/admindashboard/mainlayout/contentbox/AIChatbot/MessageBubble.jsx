// components/AIChatbot/MessageBubble.jsx
import React from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatContent = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={`flex gap-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } animate-fadeIn`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : message.isError
              ? 'bg-gradient-to-br from-red-500 to-rose-600'
              : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <FaUser className="text-white text-sm" />
        ) : (
          <FaRobot className="text-white text-sm" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md border-2 ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-lg border-blue-600'
            : message.isError
              ? 'bg-red-50 text-red-700 border-dashed border-red-200 rounded-tl-lg'
              : 'bg-white text-gray-800 border-dashed border-gray-200 rounded-tl-lg'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {formatContent(message.content)}
        </div>
        <div
          className={`text-[11px] mt-2.5 font-medium ${
            isUser ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
