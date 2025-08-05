import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPERADMIN } from '../constants/superadmin';

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === SUPERADMIN.username && password === SUPERADMIN.password) {
      setAuth({ isAuthenticated: true, role: 'superadmin' });
      navigate('/create');
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setAuth({ isAuthenticated: true, role: 'user' });
        navigate('/');
      } else {
        alert('Invalid credentials');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} className="p-2 border rounded" />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
