import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message, isOwn }) => {
  const { user } = useAuth();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && (
          <img
            src={message.senderId?.avatarUrl}
            alt={message.senderId?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <div>
          <div className={isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}>
            <p className="break-words">{message.text}</p>
          </div>
          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
