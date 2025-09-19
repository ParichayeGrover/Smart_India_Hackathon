import React from "react";
import { Users, Shield, Wrench, Globe, CheckCircle, Clock, ListTodo } from "lucide-react"; // icons

export default function Sidebar({ role, data = [] }) {
  // Hardcoded stats
  const userStats = {
    total: 120,
    admin: 5,
    worker: 35,
    public: 80,
  };

  const workerStats = {
    assigned: 12,
    completed: 8,
    pending: 4,
    shift: "Morning (9 AM - 5 PM)",
  };

  // Public role: calculate contamination info
  const contaminatedCount = data.filter((d) => d.status === "Contaminated").length;
  const safeCount = data.filter((d) => d.status === "Safe").length;
  const lastUpdate = data.length > 0 ? data[data.length - 1].date : "N/A";

  return (
    <div className="w-64 bg-slate-800 p-6 flex flex-col shadow-xl">
      <h1 className="text-xl font-bold mb-6 text-slate-100">Sidebar</h1>

      {/* Admin Sidebar */}
      {role === "admin" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Users className="text-emerald-400" />
            <div>
              <p className="text-slate-300 text-sm">Total Users</p>
              <p className="font-bold text-lg">{userStats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Shield className="text-amber-400" />
            <div>
              <p className="text-slate-300 text-sm">Admins</p>
              <p className="font-bold">{userStats.admin}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Wrench className="text-blue-400" />
            <div>
              <p className="text-slate-300 text-sm">Workers</p>
              <p className="font-bold">{userStats.worker}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Globe className="text-purple-400" />
            <div>
              <p className="text-slate-300 text-sm">Public</p>
              <p className="font-bold">{userStats.public}</p>
            </div>
          </div>
        </div>
      )}

      {/* Worker Sidebar */}
      {role === "worker" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <ListTodo className="text-cyan-400" />
            <div>
              <p className="text-slate-300 text-sm">Assigned Tasks</p>
              <p className="font-bold text-lg">{workerStats.assigned}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <CheckCircle className="text-green-400" />
            <div>
              <p className="text-slate-300 text-sm">Completed</p>
              <p className="font-bold">{workerStats.completed}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Clock className="text-red-400" />
            <div>
              <p className="text-slate-300 text-sm">Pending</p>
              <p className="font-bold">{workerStats.pending}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Wrench className="text-yellow-400" />
            <div>
              <p className="text-slate-300 text-sm">Shift</p>
              <p className="font-bold">{workerStats.shift}</p>
            </div>
          </div>
        </div>
      )}

      {/* Public Sidebar */}
      {role === "public" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Globe className="text-red-400" />
            <div>
              <p className="text-slate-300 text-sm">Contaminated Areas</p>
              <p className="font-bold">{contaminatedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <CheckCircle className="text-emerald-400" />
            <div>
              <p className="text-slate-300 text-sm">Safe Areas</p>
              <p className="font-bold">{safeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Clock className="text-amber-400" />
            <div>
              <p className="text-slate-300 text-sm">Last Update</p>
              <p className="font-bold">{lastUpdate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Default for others */}
      {role !== "admin" && role !== "worker" && role !== "public" && (
        <p className="text-slate-400">Sidebar for {role}</p>
      )}
    </div>
  );
}
