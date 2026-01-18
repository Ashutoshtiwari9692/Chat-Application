import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { initSocket, disconnectSocket, getSocket } from '../api/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        // Initialize socket connection
        const socket = initSocket();
        socket.connect();
        socket.emit('join', JSON.parse(savedUser)._id);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      setToken(data.data.token);
      setUser(data.data);
      
      // Connect socket
      const socket = initSocket();
      socket.connect();
      socket.emit('join', data.data._id);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      setToken(data.data.token);
      setUser(data.data);
      
      // Connect socket
      const socket = initSocket();
      socket.connect();
      socket.emit('join', data.data._id);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    // Disconnect socket
    disconnectSocket();
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
