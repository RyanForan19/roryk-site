import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
<nav className="bg-blue-600 px-6 py-4 text-white shadow">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <div className="space-x-6 text-lg">
      <Link to="/" className="hover:text-blue-200 transition">Home</Link>
      {auth.role === 'superadmin' && <Link to="/create" className="hover:underline">Create User</Link>}
      {isAuthenticated && <Link to="/protected" className="hover:text-blue-200 transition">Protected</Link>}
    </div>
    <div>
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/login"
          className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Login
        </Link>
        
      )}
    </div>
  </div>
</nav>

  );
}

export default Navbar;