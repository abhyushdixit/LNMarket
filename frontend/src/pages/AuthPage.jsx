import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Added to show verification instructions
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      // Explicitly direct the network call to your port 5000 Express backend
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      if (isLogin) {
        // Log in successfully if they are already verified
        login(data.user, data.token);
      } else {
        // If registering, show them the terminal instruction alert
        setSuccessMessage(data.message || 'Registration successful! Check your backend terminal for the verification link.');
        setIsLogin(true); // Automatically switch to the Login view so they can try signing in
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-charcoal border border-electric/40 p-8 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">
          LN<span className="text-cyber">Market</span>
        </h1>
        <p className="text-center text-gray-400 mb-6">
          {isLogin ? 'Welcome back to campus' : 'Join the campus marketplace'}
        </p>

        {/* Display Error Message */}
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        
        {/* Display Success/Verification Instructions */}
        {successMessage && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 p-3 rounded mb-4 text-sm font-medium">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-cyber text-white"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input
            type="email"
            placeholder="LNMIIT Email (@lnmiit.ac.in)"
            required
            pattern="^[\w-\.]+@lnmiit\.ac\.in$"
            title="Must be a valid @lnmiit.ac.in email address"
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-cyber text-white"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-cyber text-white"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="w-full bg-electric hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMessage('');
            }} 
            className="text-cyber hover:underline"
          >
            {isLogin ? 'Sign up here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}