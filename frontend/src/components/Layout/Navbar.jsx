import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title }) {
  const navigate = useNavigate();

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };

  const user = getUserInfo();

  const handleLogout = () => {
    // Clear any authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Navigate back to home page
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between bg-slate-800 px-6 py-4 rounded-xl shadow-md">
      {/* Left: Title */}
      <h1 className="text-xl font-semibold text-slate-100">{title}</h1>

      {/* Right: Profile */}
      <div className="flex items-center gap-4">
        <span className="text-slate-300">
          Hello, {user?.username || 'User'} 
          {user?.role && (
            <span className="ml-1 text-xs px-2 py-1 bg-slate-700 rounded-full">
              {user.role}
            </span>
          )}
        </span>
        <button 
          onClick={handleLogout}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
