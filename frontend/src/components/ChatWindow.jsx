import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    activeChat,
    messages,
    loadMessages,
    sendMessage,
    onlineUsers,
    typingUsers,
    setTyping
  } = useChat();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(activeChat._id, messageText.trim());
      setMessageText('');
      setTyping(activeChat._id, false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (e.target.value.length > 0) {
      setTyping(activeChat._id, true);

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(activeChat._id, false);
      }, 2000);
    } else {
      setTyping(activeChat._id, false);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
          <p className="text-sm">Select a chat from the sidebar or start a new conversation</p>
        </div>
      </div>
    );
  }

  const otherUser = activeChat.participants.find((p) => p._id !== user._id);
  const isOtherUserOnline = onlineUsers.includes(otherUser?._id);
  const isOtherUserTyping = typingUsers[activeChat._id] === otherUser?._id;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={otherUser?.avatarUrl}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOtherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
            <p className="text-sm text-gray-500">
              {isOtherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.senderId._id === user._id}
            />
          ))
        )}

        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <img
              src={otherUser?.avatarUrl}
              alt={otherUser?.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>{otherUser?.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="input-field"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="btn-primary px-6"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
