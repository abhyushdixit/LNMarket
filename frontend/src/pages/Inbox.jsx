import { useState, useEffect, useContext } from 'react'; // 1. Added useContext
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext'; // 2. Imported global context

const socket = io('http://lnmarket-backend.onrender.com');

export default function Inbox() {
  const { fetchUnreadCount } = useContext(AuthContext); // 3. Grab the recalculation trigger
  const [threads, setThreads] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  // Fetch all chat threads for the logged-in profile
  const fetchInbox = async () => {
    try {
      const { data } = await axios.get('http://lnmarket-backend.onrender.com/api/messages/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreads(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inbox threads', err);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  // Fetch message history when a user clicks on a thread card
  useEffect(() => {
    if (!activeRoom) return;

    const fetchChatHistory = async () => {
      try {
        const { data } = await axios.get(`http://lnmarket-backend.onrender.com/api/messages/${activeRoom}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(data);
        socket.emit('joinRoom', { room: activeRoom });

        // Clear unread status locally as soon as the room is loaded
        setThreads((prevThreads) =>
          prevThreads.map((t) => (t.room === activeRoom ? { ...t, isUnread: false } : t))
        );

        // 4. Recalculate global navbar badge instantly when clicking into a chat
        setTimeout(fetchUnreadCount, 50);
      } catch (err) {
        console.error('Error loading historical transmissions', err);
      }
    };

    fetchChatHistory();

    // Listen for incoming live socket text drops
    socket.on('receiveMessage', (newMessage) => {
      if (newMessage.room === activeRoom) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        // Dynamic Update: If a message arrives for another room, mark it unread instantly
        setThreads((prevThreads) =>
          prevThreads.map((t) =>
            t.room === newMessage.room ? { ...t, lastMessage: newMessage.text, isUnread: true } : t
          )
        );
        // 5. Tell global navbar badge to reflect incoming message alert instantly
        setTimeout(fetchUnreadCount, 50);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [activeRoom]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeRoom) return;

    const payload = {
      room: activeRoom,
      sender: currentUserId,
      text: typedMessage
    };

    socket.emit('sendMessage', payload);
    
    // Optimistic UI update: Set the latest preview snippet on your sidebar line item instantly
    setThreads((prevThreads) =>
      prevThreads.map((t) => (t.room === activeRoom ? { ...t, lastMessage: typedMessage } : t))
    );
    setTypedMessage('');
  };

  // Calculate local sidebar total unread count container loop check
  const totalUnreadCount = threads.filter((t) => t.isUnread).length;

  if (loading) return <div className="text-center p-10 text-gray-400">Loading your conversation hubs...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl h-[80vh] flex">
      
      {/* LEFT COLUMN: CONVERSATION LIST */}
      <div className="w-1/3 border-r border-gray-800 bg-charcoal/40 overflow-y-auto">
        
        {/* Dynamic Inbox Header with Red Badge Notification Array */}
        <div className="p-4 border-b border-gray-800 font-bold text-lg text-white flex items-center justify-between">
          <span>Marketplace Inbox</span>
          {totalUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {totalUnreadCount}
            </span>
          )}
        </div>

        {threads.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No active conversations found yet.</p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.room}
              onClick={() => setActiveRoom(thread.room)}
              className={`p-4 border-b border-gray-800 cursor-pointer transition-all flex items-center justify-between ${
                activeRoom === thread.room 
                  ? 'bg-electric/20 border-l-4 border-l-cyber' 
                  : thread.isUnread 
                    ? 'bg-cyber/5 hover:bg-gray-800/80' 
                    : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="overflow-hidden flex-1 pr-2">
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`text-sm truncate w-[70%] ${thread.isUnread ? 'font-black text-white' : 'font-semibold text-gray-200'}`}>
                    {thread.listing.title}
                  </h4>
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black ${
                    thread.role === 'seller' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/10' : 'bg-purple-500/20 text-purple-300 border border-purple-500/10'
                  }`}>
                    {thread.role}
                  </span>
                </div>
                <p className={`text-xs truncate ${thread.isUnread ? 'text-cyber font-medium' : 'text-gray-400'}`}>
                  {thread.lastMessage}
                </p>
              </div>

              {/* CYAN UNREAD INDICATOR DOT */}
              {thread.isUnread && (
                <span className="w-2.5 h-2.5 bg-cyber rounded-full flex-shrink-0 ml-2 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-ping-once" />
              )}
            </div>
          ))
        )}
      </div>

      {/* RIGHT COLUMN: ACTIVE CHAT SHELL WINDOW */}
      <div className="w-2/3 flex flex-col bg-gray-900">
        {activeRoom ? (
          <>
            <div className="p-4 border-b border-gray-800 bg-charcoal/20 flex justify-between items-center">
              <span className="font-bold text-white">Live Negotiation Gateway</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-950/40">
              {messages.map((msg, index) => {
                const isMe = msg.sender === currentUserId;
                return (
                  <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-lg px-4 py-2 text-sm text-white ${isMe ? 'bg-electric shadow-lg rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-charcoal/30 flex gap-2">
              <input
                type="text"
                placeholder="Type a response payload..."
                value={typedMessage}
                className="flex-1 bg-gray-950 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-cyber text-white text-sm"
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <button type="submit" className="bg-cyber hover:bg-cyan-500 text-slate-900 font-bold px-5 py-2 rounded text-sm transition-all">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-2">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Select a conversation thread from the inbox array to begin chatting</p>
          </div>
        )}
      </div>

    </div>
  );
}
