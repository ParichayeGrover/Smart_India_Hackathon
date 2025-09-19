import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Reports", path: "/reports" },
    { name: "Alerts", path: "/alerts" },
  ];

  return (
    <aside className="w-64 bg-blue-700 text-white flex flex-col h-screen shadow-lg">
      <h2
        className="p-6 text-2xl font-extrabold tracking-wide border-b border-blue-600"
        style={{ textShadow: "0 0 4px rgba(0,0,0,0.4)" }}
      >
        Menu
      </h2>
      <nav className="flex-1">
        <ul className="mt-4">
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`block px-5 py-3 rounded-lg text-lg font-bold text-white transition-all duration-200 
                ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-blue-600 hover:text-white"
                }`}
                style={{ textShadow: "0 0 4px rgba(0,0,0,0.4)" }}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
