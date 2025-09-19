import React, { useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function AdminDashboard() {
  const [contaminationData, setContaminationData] = useState([
    { area: "Sector 21", status: "Contaminated", level: "High", lastUpdated: "19 Sep 2025, 10:30 AM", source: "Groundwater", worker: "" },
    { area: "Sector 15", status: "Safe", level: "Low", lastUpdated: "19 Sep 2025, 9:15 AM", source: "Municipal Supply", worker: "" },
    { area: "Village Rampur", status: "Contaminated", level: "Moderate", lastUpdated: "19 Sep 2025, 8:45 AM", source: "Hand Pumps", worker: "" },
    { area: "Sector 30", status: "Contaminated", level: "Severe", lastUpdated: "19 Sep 2025, 11:00 AM", source: "Pipeline Leak", worker: "" },
    { area: "Sector 42", status: "Safe", level: "Low", lastUpdated: "19 Sep 2025, 7:30 AM", source: "Overhead Tank", worker: "" },
    { area: "Village Dharampur", status: "Contaminated", level: "High", lastUpdated: "19 Sep 2025, 6:50 AM", source: "Open Wells", worker: "" },
  ]);

  const workers = ["worker1", "worker2", "worker3"];

  // Assign worker to area
  const assignWorker = (index, worker) => {
    const newData = [...contaminationData];
    newData[index].worker = worker;
    setContaminationData(newData);
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">
        <Navbar title="Admin Dashboard" />

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {contaminationData.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800 p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              <h2 className="text-xl font-semibold mb-3">{item.area}</h2>
              <p className={`text-lg font-bold mb-2 ${item.status === "Contaminated" ? "text-red-400" : "text-green-400"}`}>
                {item.status}
              </p>
              <p className="text-slate-300 text-sm">Level: <span className="font-medium">{item.level}</span></p>
              <p className="text-slate-400 text-xs mt-1">Source: {item.source}</p>
              <p className="text-slate-500 text-xs mt-1">Last Updated: {item.lastUpdated}</p>

              {/* Assign Worker */}
              <div className="mt-3">
                <label className="text-slate-300 text-sm">Assign Worker:</label>
                <select
                  className="w-full mt-1 p-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none"
                  value={item.worker}
                  onChange={(e) => assignWorker(index, e.target.value)}
                >
                  <option value="">Select</option>
                  {workers.map((w, idx) => (
                    <option key={idx} value={w}>{w}</option>
                  ))}
                </select>
                {item.worker && <p className="text-slate-300 mt-1 text-sm">Assigned to: {item.worker}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
