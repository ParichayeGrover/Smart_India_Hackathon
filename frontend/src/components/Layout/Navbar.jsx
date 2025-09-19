import React from "react";

export default function Navbar({ title }) {
  return (
    <nav className="flex items-center justify-between bg-slate-800 px-6 py-4 rounded-xl shadow-md">
      {/* Left: Title */}
      <h1 className="text-xl font-semibold text-slate-100">{title}</h1>

      {/* Right: Profile */}
      <div className="flex items-center gap-4">
        <span className="text-slate-300">Hello, User</span>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-md transition">
          Logout
        </button>
      </div>
    </nav>
  );
}
