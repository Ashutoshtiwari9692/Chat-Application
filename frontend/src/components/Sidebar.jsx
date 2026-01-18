import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../api/axios';
import AvatarUpload from './AvatarUpload';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { chats, activeChat, setActiveChat, createOrOpenChat, onlineUsers } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await api.get(`/users/search?q=${query}`);
      setSearchResults(data.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const chat = await createOrOpenChat(userId);
      setActiveChat(chat);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants.find((p) => p._id !== user._id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const formatLastSeen = (lastSeen) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user?.avatarUrl}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => setShowAvatarUpload(true)}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Search Toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full btn-primary"
        >
          {showSearch ? 'Show Chats' : 'New Chat'}
        </button>
      </div>

      {/* Search or Chats */}
      <div className="flex-1 overflow-y-auto">
        {showSearch ? (
          <div className="p-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field mb-4"
              autoFocus
            />

            <div className="space-y-2">
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  onClick={() => handleSelectUser(searchUser._id)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={searchUser.avatarUrl}
                      alt={searchUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {isUserOnline(searchUser._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{searchUser.name}</h3>
                    <p className="text-sm text-gray-500">{searchUser.email}</p>
                  </div>
                </div>
              ))}

              {searchQuery && searchResults.length === 0 && (
                <p className="text-center text-gray-500 py-4">No users found</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No chats yet</p>
                <p className="text-sm mt-2">Click "New Chat" to start</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = getOtherUser(chat);
                return (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                      activeChat?._id === chat._id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={otherUser?.avatarUrl}
                        alt={otherUser?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {isUserOnline(otherUser?._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {otherUser?.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {isUserOnline(otherUser?._id)
                        ? 'Online'
                        : formatLastSeen(otherUser?.lastSeen)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <AvatarUpload
          onClose={() => setShowAvatarUpload(false)}
          onUpdate={(newAvatarUrl) => {
            // Avatar is already updated in context
            console.log('Avatar updated:', newAvatarUrl);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;
