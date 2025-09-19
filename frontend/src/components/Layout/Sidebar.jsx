import React from "react";

import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  const menus = {
    admin: [
      { name: "Dashboard", path: "/dashboard/admin" },
      { name: "Users", path: "#" },
      { name: "Reports", path: "#" },
      { name: "Settings", path: "#" },
    ],
    worker: [
      { name: "Dashboard", path: "/dashboard/worker" },
      { name: "Tasks", path: "#" },
      { name: "Schedule", path: "#" },
      { name: "Reports", path: "#" },
    ],
    public: [
      { name: "Dashboard", path: "/dashboard/public" },
      { name: "Health Info", path: "#" },
      { name: "Submit Report", path: "#" },
      { name: "Support", path: "#" },
    ],
  };

  return (
    <aside className="w-64 bg-slate-800 p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-100 mb-6 capitalize">
        {role} Panel
      </h2>
      <ul className="space-y-3">
        {menus[role].map((item, i) => (
          <li key={i}>
            <Link
              to={item.path}
              className="block px-4 py-2 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-white text-slate-300 transition"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
