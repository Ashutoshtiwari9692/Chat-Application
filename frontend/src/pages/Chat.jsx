import { ChatProvider } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
};

export default Chat;
