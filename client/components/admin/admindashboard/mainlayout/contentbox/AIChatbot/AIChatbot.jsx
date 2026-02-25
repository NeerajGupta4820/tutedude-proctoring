import React, { useState, useRef, useEffect } from 'react';
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaSpinner,
  FaTrash,
  FaExpand,
  FaCompress,
  FaSearch,
  FaShieldAlt,
  FaChartBar,
  FaUserCheck,
  FaLightbulb,
  FaMagic,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const API_URL = 'http://localhost:5000/api';

// Suggestion chips for quick actions
const QUICK_SUGGESTIONS = [
  {
    text: 'Cheating report — last week',
    icon: FaShieldAlt,
    color: 'from-red-500 to-rose-600',
  },
  {
    text: 'Overall interview stats',
    icon: FaChartBar,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    text: 'Top performing candidates',
    icon: FaUserCheck,
    color: 'from-emerald-500 to-green-600',
  },
  {
    text: 'Suggest interview questions',
    icon: FaLightbulb,
    color: 'from-amber-500 to-orange-600',
  },
];

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    // 1. User ka message add karo
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 2. Placeholder AI Message add karo (Empty content ke saath)
    const aiMessageId = Date.now() + 1;
    const initialAiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '', // Shuru mein khaali
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, initialAiMessage]);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: 'user', content: text });

      // 3. Streaming Request bhejo
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: conversationHistory,
          stream: true, // ⚡ STREAMING ON ⚡
        }),
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      // 4. Stream Reader setup karo
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Chunk decode karo
        const chunk = decoder.decode(value, { stream: true });
        
        // Ollama multiple JSON objects ek saath bhej sakta hai, unhe parse karo
        // Format: { "model": "...", "created_at": "...", "message": { "role": "assistant", "content": "Hello" }, "done": false }
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message && json.message.content) {
              const content = json.message.content;
              accumulatedContent += content;

              // 5. UI ko Real-time update karo
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            }
            if (json.done) {
              setIsLoading(false);
            }
          } catch (e) {
            console.error('Error parsing JSON chunk', e);
          }
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: '❌ Error: Connection lost. Check Ollama.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format message content with basic markdown-like support
  const formatContent = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={`flex flex-col ${isExpanded ? 'fixed inset-0 z-50 bg-gray-200 p-4' : 'h-[calc(100vh-140px)]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-t-2xl px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
            <HiSparkles className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              AI Assistant
              <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/40">
                ONLINE
              </span>
            </h2>
            <p className="text-blue-100 text-xs">
              Interview analysis • Cheating detection • Reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Clear chat"
          >
            <FaTrash size={13} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <FaCompress size={13} /> : <FaExpand size={13} />}
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-5 space-y-4"
      >
        {/* Welcome Message (shown when no messages) */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            {/* Animated AI Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
                <FaRobot className="text-white text-3xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <HiSparkles className="text-white text-xs" />
              </div>
            </div>

            <h3 className="text-slate-800 font-bold text-xl mb-2">
              Hi! I'm your AI Interview Assistant
            </h3>
            <p className="text-slate-500 text-sm mb-8 max-w-md">
              I can analyze interviews, detect cheating patterns, generate reports, 
              and help you with candidate evaluations. Ask me anything!
            </p>

            {/* Quick Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {QUICK_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion.text)}
                  className="group flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200"
                >
                  <div className={`w-9 h-9 bg-gradient-to-br ${suggestion.color} rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                    <suggestion.icon size={14} />
                  </div>
                  <span className="text-slate-600 text-sm font-medium group-hover:text-slate-800 transition-colors">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : message.isError
                  ? 'bg-gradient-to-br from-red-500 to-rose-600'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600'
              }`}
            >
              {message.role === 'user' ? (
                <FaUser className="text-white text-xs" />
              ) : (
                <FaRobot className="text-white text-xs" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
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
                  message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex gap-3 items-start animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <FaRobot className="text-white text-xs" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-400 ml-2">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 rounded-b-2xl px-4 py-3 shadow-lg">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about interviews, cheating reports, or candidate analysis..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              inputMessage.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <FaPaperPlane size={14} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          AI can make mistakes. Always verify important information.
        </p>
      </div>

      {/* Custom Animation Styles */}
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
