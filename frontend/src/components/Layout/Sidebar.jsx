import React from "react";
import { Users, Shield, Wrench, Globe, CheckCircle, Clock, ListTodo, Droplets } from "lucide-react"; // icons

export default function Sidebar({ role, data = [], stats = {} }) {
  // Admin role: calculate stats from data
  const adminStats = role === "admin" ? {
    totalWaterBodies: data.length || 0,
    safeWaterBodies: data.filter((d) => d.status === "Safe").length || 0,
    contaminatedWaterBodies: data.filter((d) => d.status === "Contaminated").length || 0,
    totalWorkers: stats.totalWorkers || 0,
    ...stats
  } : {};

  // Worker role: calculate stats from assigned water bodies
  const workerStats = role === "worker" ? {
    assignedTasks: data.length || 0,
    completedTasks: data.filter((d) => d.status === "Safe").length || 0,
    pendingTasks: data.filter((d) => d.status === "Contaminated" || !d.status).length || 0,
    recentTests: data.filter((d) => {
      const testDate = new Date(d.date || d.last_tested);
      const today = new Date();
      const daysDiff = (today - testDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length || 0,
    ...stats
  } : {};

  // Public role: calculate contamination info
  const contaminatedCount = data.filter((d) => d.status === "Contaminated").length;
  const safeCount = data.filter((d) => d.status === "Safe").length;
  const lastUpdate = data.length > 0 ? data[0].date : "N/A";

  return (
    <div className="w-64 bg-slate-800 p-6 flex flex-col shadow-xl">
      <h1 className="text-xl font-bold mb-6 text-slate-100">
        {role === "admin" ? "Admin Panel" : role === "worker" ? "Worker Panel" : "Public Info"}
      </h1>

      {/* Admin Sidebar */}
      {role === "admin" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Droplets className="text-blue-400" />
            <div>
              <p className="text-slate-300 text-sm">Total Water Bodies</p>
              <p className="font-bold text-lg">{adminStats.totalWaterBodies}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <CheckCircle className="text-green-400" />
            <div>
              <p className="text-slate-300 text-sm">Safe Sources</p>
              <p className="font-bold">{adminStats.safeWaterBodies}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Shield className="text-red-400" />
            <div>
              <p className="text-slate-300 text-sm">Contaminated</p>
              <p className="font-bold">{adminStats.contaminatedWaterBodies}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Wrench className="text-yellow-400" />
            <div>
              <p className="text-slate-300 text-sm">Active Workers</p>
              <p className="font-bold">{adminStats.totalWorkers}</p>
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
              <p className="text-slate-300 text-sm">Assigned Areas</p>
              <p className="font-bold text-lg">{workerStats.assignedTasks}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <CheckCircle className="text-green-400" />
            <div>
              <p className="text-slate-300 text-sm">Safe Areas</p>
              <p className="font-bold">{workerStats.completedTasks}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Clock className="text-red-400" />
            <div>
              <p className="text-slate-300 text-sm">Need Testing</p>
              <p className="font-bold">{workerStats.pendingTasks}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-700 p-3 rounded-lg">
            <Droplets className="text-blue-400" />
            <div>
              <p className="text-slate-300 text-sm">Recent Tests</p>
              <p className="font-bold">{workerStats.recentTests}</p>
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
