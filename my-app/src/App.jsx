import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';

function App() {
  const [auth, setAuth] = React.useState(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : { isAuthenticated: false, role: null };
  });

  const setAuthState = (authState) => {
    localStorage.setItem('auth', JSON.stringify(authState));
    setAuth(authState);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Router>
        <Navbar auth={auth} setAuth={setAuthState} />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setAuth={setAuthState} />} />
            <Route path="/create" element={auth.role === 'superadmin' ? <CreateAccount /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
