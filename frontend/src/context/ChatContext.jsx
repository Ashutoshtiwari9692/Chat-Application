import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../api/socket';
import api from '../api/axios';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
      
      // Setup socket listeners
      const socket = getSocket();
      
      socket.on('online_users', (users) => {
        setOnlineUsers(users);
      });
      
      socket.on('private_message', (message) => {
        // Add message to state if it belongs to active chat
        if (message.chatId === activeChat?._id) {
          setMessages((prev) => [...prev, message]);
        }
        
        // Update chat list
        loadChats();
      });
      
      socket.on('user_typing', ({ chatId, userId, isTyping }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: isTyping ? userId : null
        }));
      });
      
      return () => {
        socket.off('online_users');
        socket.off('private_message');
        socket.off('user_typing');
      };
    }
  }, [isAuthenticated, activeChat]);

  const loadChats = async () => {
    try {
      const { data } = await api.get('/chats');
      setChats(data.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const createOrOpenChat = async (userId) => {
    try {
      const { data } = await api.post('/chats', { userId });
      await loadChats();
      return data.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const { data } = await api.get(`/messages/${chatId}`);
      setMessages(data.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (chatId, text) => {
    try {
      const { data } = await api.post('/messages', { chatId, text });
      
      // Emit socket event
      const socket = getSocket();
      const recipient = activeChat.participants.find(p => p._id !== user._id);
      
      socket.emit('private_message', {
        recipientId: recipient._id,
        message: data.data
      });
      
      setMessages((prev) => [...prev, data.data]);
      await loadChats();
      
      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const setTyping = (chatId, isTyping) => {
    const socket = getSocket();
    const recipient = activeChat?.participants.find(p => p._id !== user._id);
    
    if (recipient) {
      socket.emit('typing', {
        chatId,
        userId: user._id,
        recipientId: recipient._id,
        isTyping
      });
    }
  };

  const value = {
    chats,
    activeChat,
    setActiveChat,
    messages,
    onlineUsers,
    typingUsers,
    loadChats,
    createOrOpenChat,
    loadMessages,
    sendMessage,
    setTyping
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
