import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
  const { user, logout, unreadCount } = useContext(AuthContext); // ✨ Grab unreadCount here!
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        <Link to="/" className="text-2xl font-black text-white tracking-wider">
          LN<span className="text-cyber">Market</span>
        </Link>

        <div className="flex items-center gap-4">
          
          {/* Global Link Button with Context Red Badge Notification Counter */}
          <Link 
            to="/inbox" 
            className="flex items-center gap-2 text-gray-300 hover:text-cyber font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50 relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Inbox</span>
            
            {/* 🔴 RED BADGE NUMBER (Visible across all website pages) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link 
            to="/add" 
            className="bg-electric hover:bg-purple-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-[0_0_10px_rgba(109,40,217,0.2)]"
          >
            + Post Listing
          </Link>

          <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              Hi, {user?.name || 'Student'}
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-500 font-bold border border-red-500/20 hover:border-red-500/50 px-2.5 py-1.5 rounded bg-red-500/5 transition-colors"
            >
              Logout
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
}