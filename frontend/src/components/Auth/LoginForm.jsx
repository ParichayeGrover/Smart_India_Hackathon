import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ title, accent }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hardcoded credentials
  const credentials = {
    admin: { username: "admin", password: "admin123", redirect: "/dashboard/admin" },
    worker: { username: "worker", password: "worker123", redirect: "/dashboard/worker" },
    public: { username: "public", password: "public123", redirect: "/dashboard/public" },
  };

  // Determine which role this form belongs to
  const role = title.toLowerCase().includes("admin")
    ? "admin"
    : title.toLowerCase().includes("worker")
    ? "worker"
    : "public";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      username === credentials[role].username &&
      password === credentials[role].password
    ) {
      navigate(credentials[role].redirect);
    } else {
      setError("Invalid username or password");
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
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className={`${accentColor[accent]} text-white py-2 rounded-lg shadow-md transition transform hover:scale-105`}
        >
          Login
        </button>
      </form>
    </div>
  );
}
