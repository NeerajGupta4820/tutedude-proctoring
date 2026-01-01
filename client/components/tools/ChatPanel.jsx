// components/tools/ChatPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FaTimes,
  FaPaperPlane,
  FaSpinner,
  FaUserTie,
  FaUser,
  FaLock,
} from 'react-icons/fa';
import { IoCheckmarkDone, IoCheckmark } from 'react-icons/io5';
import { BsChatDots, BsShieldCheck, BsEmojiSmile } from 'react-icons/bs';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const ChatPanel = ({
  meetingId,
  socket,
  currentUser,
  onClose,
  participants = [],
  interviewRole = 'candidate',
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!meetingId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/chats/room/${meetingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 100 },
          }
        );

        if (response.data.success) {
          const fetchedMessages = response.data.data.map((msg) => ({
            _id: msg._id,
            message: msg.message,
            sender: msg.sender,
            timestamp: msg.createdAt,
            messageType: msg.messageType,
            isMe: msg.sender?.userId === currentUser?.id,
            isRead: msg.readBy?.length > 0,
            role: msg.sender?.role || 'candidate',
          }));
          setMessages(fetchedMessages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        if (err.response?.status !== 404) {
          setError('Failed to load messages');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [meetingId, currentUser?.id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const newMsg = {
        _id: data._id,
        message: data.message,
        sender: data.sender,
        timestamp: data.createdAt,
        messageType: data.messageType,
        isMe: data.sender?.userId === currentUser?.id,
        isRead: false,
        role: data.sender?.role || 'candidate',
      };

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === data._id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
    };

    const handleUserTyping = ({ userId, userName }) => {
      if (userId === currentUser?.id) return;
      setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
    };

    const handleUserStoppedTyping = ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleMessageError = ({ error: errorMsg }) => {
      setError(errorMsg);
      setIsSending(false);
    };

    const handleMessagesRead = ({ userId }) => {
      if (userId !== currentUser?.id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.isMe ? { ...msg, isRead: true } : msg))
        );
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageError', handleMessageError);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageError', handleMessageError);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, currentUser?.id]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (socket && meetingId) {
      socket.emit('markAsRead', { meetingId });
    }
  }, [socket, meetingId, messages.length]);

  const handleTyping = () => {
    if (!socket || !meetingId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { meetingId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stopTyping', { meetingId });
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !meetingId || isSending) return;

    setIsSending(true);
    setError(null);
    setShowEmojiPicker(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    socket.emit('stopTyping', { meetingId });

    socket.emit('sendMessage', {
      meetingId,
      message: newMessage.trim(),
      messageType: 'text',
    });

    setNewMessage('');
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId) => {
    if (!socket || !meetingId) return;
    socket.emit('deleteMessage', { meetingId, messageId });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Emoji handler
  const onEmojiClick = (emojiData) => {
    const cursor = inputRef.current?.selectionStart || newMessage.length;
    const textBefore = newMessage.substring(0, cursor);
    const textAfter = newMessage.substring(cursor);
    const newText = textBefore + emojiData.emoji + textAfter;

    setNewMessage(newText);
    handleTyping();

    // Focus back to input and set cursor position after emoji
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = cursor + emojiData.emoji.length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypingText = () => {
    const names = Object.values(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.length} people are typing...`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleConfig = (role, isMe) => {
    if (role === 'interviewer') {
      return {
        bubbleBg: isMe
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700'
          : 'bg-gradient-to-br from-slate-700 to-slate-800',
        bubbleText: 'text-white',
        avatarBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
        icon: FaUserTie,
        badge: 'Interviewer',
        badgeColor: 'bg-indigo-100 text-indigo-700',
        timeColor: isMe ? 'text-indigo-200' : 'text-slate-400',
      };
    }
    return {
      bubbleBg: isMe
        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
        : 'bg-white',
      bubbleText: isMe ? 'text-white' : 'text-gray-800',
      avatarBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      icon: FaUser,
      badge: 'Candidate',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      timeColor: isMe ? 'text-emerald-200' : 'text-gray-400',
    };
  };

  // Quick emoji reactions for professional chat
  const quickEmojis = ['👍', '👏', '✅', '💡', '🤔', '📝'];

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col overflow-hidden rounded-lg shadow-xl border border-slate-200">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white px-4 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <BsChatDots size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                Interview Chat
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <FaLock size={8} />
                Secure & Confidential
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Participants Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {participants.slice(0, 5).map((participant, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-2 py-1 rounded-full flex-shrink-0"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white ${
                  participant.role === 'interviewer'
                    ? 'bg-indigo-500'
                    : 'bg-emerald-500'
                }`}
              >
                {getInitials(participant.name)}
              </div>
              <span className="text-xs text-white/80 max-w-[80px] truncate">
                {participant.name?.split(' ')[0]}
              </span>
              {participant.role === 'interviewer' && (
                <HiOutlineOfficeBuilding
                  size={10}
                  className="text-indigo-300"
                />
              )}
            </div>
          ))}
          {participants.length > 5 && (
            <span className="text-xs text-white/60 flex-shrink-0">
              +{participants.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-100 text-red-600 px-4 py-2 text-sm flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {/* Interview Guidelines Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2 text-amber-700">
          <BsShieldCheck size={14} />
          <span className="text-xs font-medium">
            Professional communication only • Messages are recorded for review
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
              <FaSpinner className="animate-spin text-slate-500" size={20} />
            </div>
            <span className="text-slate-500 text-sm">
              Loading conversation...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <BsChatDots size={32} className="text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">
              Interview Chat Ready
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Use this chat for any clarifications or to share important
              information during the interview.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                💬 Ask questions
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                📎 Share links
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                ✍️ Take notes
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Session Start Indicator */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                Interview Session Started
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {messages.map((msg, idx) => {
              const showAvatar =
                idx === 0 ||
                messages[idx - 1]?.sender?.userId !== msg.sender?.userId;

              const roleConfig = getRoleConfig(
                msg.role || msg.sender?.role,
                msg.isMe
              );
              const IconComponent = roleConfig.icon;

              const showTimeGap =
                idx > 0 &&
                new Date(msg.timestamp) -
                  new Date(messages[idx - 1]?.timestamp) >
                  300000;

              return (
                <React.Fragment key={msg._id}>
                  {showTimeGap && (
                    <div className="flex items-center justify-center py-2">
                      <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} ${
                      showAvatar ? 'mt-4' : 'mt-1'
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[80%] ${
                        msg.isMe ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      {!msg.isMe && showAvatar ? (
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg ${roleConfig.avatarBg}`}
                          >
                            <IconComponent size={16} />
                          </div>
                        </div>
                      ) : !msg.isMe ? (
                        <div className="w-9 flex-shrink-0"></div>
                      ) : null}

                      {/* Message Content */}
                      <div className="flex flex-col">
                        {/* Sender Info */}
                        {showAvatar && !msg.isMe && (
                          <div className="flex items-center gap-2 mb-1 ml-1">
                            <span className="text-xs font-medium text-slate-700">
                              {msg.sender?.name}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleConfig.badgeColor}`}
                            >
                              {roleConfig.badge}
                            </span>
                          </div>
                        )}

                        <div className="flex items-end gap-1.5">
                          {/* Message Bubble */}
                          <div
                            className={`relative group px-4 py-2.5 shadow-sm ${roleConfig.bubbleBg} ${roleConfig.bubbleText} ${
                              msg.isMe
                                ? 'rounded-2xl rounded-br-md'
                                : 'rounded-2xl rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>

                            {/* Timestamp */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 ${roleConfig.timeColor}`}
                            >
                              <span className="text-[10px]">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>

                            {/* Delete button */}
                            {msg.isMe && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {/* Read Receipt */}
                          {msg.isMe && (
                            <div className="flex-shrink-0 mb-2">
                              {msg.isRead ? (
                                <IoCheckmarkDone
                                  size={16}
                                  className="text-indigo-500"
                                />
                              ) : (
                                <IoCheckmark
                                  size={16}
                                  className="text-slate-400"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Typing Indicator */}
            {getTypingText() && (
              <div className="flex items-center gap-2 ml-11">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {getTypingText()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Emoji Picker */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 p-3 relative">
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 right-0 mb-2 flex justify-center z-50"
          >
            <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-200">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={320}
                height={400}
                searchPlaceHolder="Search emoji..."
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
                categories={[
                  { name: 'Smileys & People', category: 'smileys_people' },
                  { name: 'Animals & Nature', category: 'animals_nature' },
                  { name: 'Food & Drink', category: 'food_drink' },
                  { name: 'Activities', category: 'activities' },
                  { name: 'Travel & Places', category: 'travel_places' },
                  { name: 'Objects', category: 'objects' },
                  { name: 'Symbols', category: 'symbols' },
                ]}
                theme="light"
              />
            </div>
          </div>
        )}

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-1 mb-2 px-1">
          <span className="text-xs text-slate-400 mr-2">Quick:</span>
          {quickEmojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                setNewMessage((prev) => prev + emoji);
                handleTyping();
                inputRef.current?.focus();
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-lg hover:scale-110"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend}>
          <div className="flex items-center gap-2">
            {/* Your Role Indicator */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                interviewRole === 'interviewer'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {interviewRole === 'interviewer' ? (
                <FaUserTie size={14} />
              ) : (
                <FaUser size={14} />
              )}
            </div>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                showEmojiPicker
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
              title="Add emoji"
            >
              <BsEmojiSmile size={20} />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder="Type your message..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-sm transition-all duration-200"
                disabled={isSending || !socket}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending || !socket}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
                !newMessage.trim() || isSending || !socket
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 hover:shadow-md active:scale-95'
              }`}
            >
              {isSending ? (
                <FaSpinner className="animate-spin" size={16} />
              ) : (
                <FaPaperPlane size={14} />
              )}
            </button>
          </div>
        </form>

        {/* Connection Status */}
        {!socket && (
          <div className="flex items-center justify-center gap-2 mt-2 text-amber-600">
            <FaSpinner className="animate-spin" size={12} />
            <span className="text-xs">Connecting to interview room...</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[10px] text-slate-400">
            Press Enter to send • Click 😊 for more emojis
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
