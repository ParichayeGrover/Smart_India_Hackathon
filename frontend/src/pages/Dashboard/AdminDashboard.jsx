import React from "react";

import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">
        <Navbar title="Admin Dashboard" />
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Total Users</div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Reports</div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">System Status</div>
        </div>
      </div>
    </div>
  );
}
