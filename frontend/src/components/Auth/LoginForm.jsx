import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ title, accent }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine which role this form belongs to
  const role = title.toLowerCase().includes("admin")
    ? "admin"
    : title.toLowerCase().includes("worker")
    ? "worker"
    : "public";

  // Define redirect paths for each role
  const redirectPaths = {
    admin: "/dashboard/admin",
    worker: "/dashboard/worker",
    public: "/dashboard/public",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // All authentication goes through the database
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map database roles to frontend roles
        const userRole = data.user.role === 'citizen' ? 'public' : data.user.role;
        
        // Verify the user has the correct role for this login form
        if (userRole !== role) {
          setError(`This account is not authorized for ${role} access. Please use the correct login page.`);
          setLoading(false);
          return;
        }

        // Store authentication data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', data.user.id);
        
        navigate(redirectPaths[role]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = {
    emerald: "bg-emerald-500 hover:bg-emerald-600",
    amber: "bg-amber-500 hover:bg-amber-600",
    slate: "bg-slate-700 hover:bg-slate-600",
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-96">
      <h2 className="text-2xl font-bold mb-6 text-slate-100">{title}</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`${accentColor[accent]} disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg shadow-md transition transform hover:scale-105`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
