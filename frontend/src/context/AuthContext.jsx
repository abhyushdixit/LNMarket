import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 🎯 PRESERVED: Set the global backend URL here so no component forces absolute strings
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [unreadCount, setUnreadCount] = useState(0); // ✨ Global unread notification tracker state

  // Global function to fetch unread chat rooms count from backend aggregator
  const fetchUnreadCount = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      // Uses your default baseURL configuration smoothly
      const { data } = await axios.get('/api/messages/inbox');
      
      if (Array.isArray(data)) {
        const count = data.filter(thread => thread.isUnread).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error fetching global unread indicators:', err);
    }
  };

  useEffect(() => {
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch unread count right away when authenticated
      fetchUnreadCount();

      // Poll the system every 8 seconds to catch incoming unread notifications dynamically
      const interval = setInterval(fetchUnreadCount, 8000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUnreadCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, unreadCount, fetchUnreadCount, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};