import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import AddListing from './pages/AddListing';
import Inbox from './pages/Inbox'; // 1. Imported your brand new Inbox dashboard component

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      {token && <Header />}
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/auth" element={!token ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <Home /> : <Navigate to="/auth" />} />
          <Route path="/add" element={token ? <AddListing /> : <Navigate to="/auth" />} />
          
          {/* 2. NEW: Authenticated Route for the Live Chats Marketplace Inbox */}
          <Route path="/inbox" element={token ? <Inbox /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;