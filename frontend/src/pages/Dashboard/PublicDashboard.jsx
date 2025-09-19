import React from "react";

import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function PublicDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar role="public" />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Public Dashboard" />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Health Info</div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Submit Report</div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Support</div>
        </div>
      </div>
    </div>
  );
}
