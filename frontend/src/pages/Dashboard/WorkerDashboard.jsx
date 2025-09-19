import React from "react";

import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function WorkerDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar role="worker" />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Worker Dashboard" />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Assigned Tasks</div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Schedule</div>
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">Reports</div>
        </div>
      </div>
    </div>
  );
}
