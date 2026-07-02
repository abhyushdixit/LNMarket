import { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

let socket;

export default function Chat({ listing, roomId, onClose }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    // Initialize Socket connection targeting the explicit backend port
    socket = io('http://localhost:5000');
    
    socket.emit('joinRoom', { room: roomId });

    // Explicitly target the full backend port URL to prevent empty relative endpoints
    axios.get(`http://localhost:5000/api/messages/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      // Ensure the incoming socket message belongs to our current active room scope
      if (message.room === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      room: roomId,
      sender: user.id || user._id, 
      text: newMessage.trim()
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    /* ✨ REMOVED fixed inset-0 screen takeover wrappers! 
      This is now a clean relative flex box filling the right panel of the split screen.
      Added e.stopPropagation() so click actions don't propagate to parent backgrounds.
    */
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="w-full h-full flex flex-col bg-gray-950"
    >
      {/* Small Chat Status Indicator subheader label */}
      <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-800 text-xs text-cyber font-medium flex justify-between items-center">
        <span>Chatting with {listing?.seller?.name || 'Seller'}</span>
        {/* Optional: Keep this fallback inline button or rely entirely 
          on the "✕ Close Window" button in ListingCard.jsx
        */}
        <button 
          type="button"
          onClick={onClose} 
          className="text-gray-500 hover:text-red-400 font-bold transition-colors md:hidden text-sm"
        >
          ✕ Close Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-950/20 max-h-[40vh] md:max-h-none">
        {messages.length === 0 ? (
          <p className="text-center text-gray-600 text-xs mt-4 italic">
            No communication telemetry recorded yet. Say hello!
          </p>
        ) : (
          messages.map((msg, idx) => {
            const currentUserId = user?.id || user?._id;
            const senderId = msg.sender?.id || msg.sender?._id || msg.sender;
            const isMe = senderId === currentUserId;
            
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                  isMe 
                    ? 'bg-electric text-white rounded-br-none shadow-md' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Embedded Input Form Footer Container Bar */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 bg-gray-900 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyber text-white"
        />
        <button 
          type="submit"
          className="bg-cyber text-charcoal font-bold rounded-xl px-4 py-2 text-xs hover:bg-cyan-400 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}