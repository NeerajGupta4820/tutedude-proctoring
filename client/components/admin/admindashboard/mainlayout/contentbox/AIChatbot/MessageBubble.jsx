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
      className={`flex gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } animate-fadeIn`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : message.isError
              ? 'bg-gradient-to-br from-red-500 to-rose-600'
              : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <FaUser className="text-white text-xs" />
        ) : (
          <FaRobot className="text-white text-xs" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-md'
            : message.isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-md'
              : 'bg-white text-slate-700 border border-slate-100 rounded-tl-md'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {formatContent(message.content)}
        </div>
        <div
          className={`text-[10px] mt-2 ${
            isUser ? 'text-blue-100' : 'text-slate-400'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
