import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
      <h1 className="text-4xl font-bold mb-8">Smart Community System</h1>
      <div className="grid gap-6 w-80">
        <Link to="/login/admin" className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl shadow-lg text-center transition transform hover:scale-105">
          Admin Login
        </Link>
        <Link to="/login/worker" className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl shadow-lg text-center transition transform hover:scale-105">
          Worker Login
        </Link>
        <Link to="/login/public" className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl shadow-lg text-center transition transform hover:scale-105">
          Public Login
        </Link>
        <Link to="/register/public" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl shadow-lg text-center transition transform hover:scale-105">
          Public Registration
        </Link>
      </div>
    </div>
  );
}
