import React, { useState } from 'react';

function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.username === username)) {
      setMessage('Username already exists');
    } else {
      users.push({ username, password });
      localStorage.setItem('users', JSON.stringify(users));
      setMessage('User created successfully');
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create New User</h2>
      {message && <div className="text-center text-green-600 mb-2">{message}</div>}
      <form onSubmit={handleCreate} className="flex flex-col space-y-4">
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} className="p-2 border rounded" />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} className="p-2 border rounded" />
        <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default CreateAccount;
