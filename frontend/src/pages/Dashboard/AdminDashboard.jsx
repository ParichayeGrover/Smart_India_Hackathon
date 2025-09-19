import React, { useEffect, useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function AdminDashboard() {

  const [contaminationData, setContaminationData] = useState([]);
  const [workers, setWorkers] = useState([]);
  // Optionally, you can store the selected village if needed
  // const [selectedVillage, setSelectedVillage] = useState(null);

  useEffect(() => {
    // Fetch contamination data (e.g., water bodies + status) for admin's village
    fetch("/api/admin/water-bodies")
      .then((res) => res.json())
      .then((data) => setContaminationData(data))
      .catch(() => setContaminationData([]));

    // Fetch workers for admin's village
    fetch("/api/admin/workers")
      .then((res) => res.json())
      .then((data) => setWorkers(data))
      .catch(() => setWorkers([]));
  }, []);

  // Assign worker to area
  const assignWorker = (index, worker) => {
    const waterBody = contaminationData[index];
    // Call backend to assign worker to water body
    fetch("/api/admin/assign-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_id: worker, water_body_id: waterBody.id }),
    })
      .then((res) => res.json())
      .then(() => {
        // Optionally update UI after assignment
        const newData = [...contaminationData];
        newData[index].worker = worker;
        setContaminationData(newData);
      });
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
              <h2 className="text-xl font-semibold mb-3">{item.name || item.area}</h2>
              <p className={`text-lg font-bold mb-2 ${item.status === "Contaminated" ? "text-red-400" : "text-green-400"}`}>
                {item.status || "Unknown"}
              </p>
              <p className="text-slate-300 text-sm">Level: <span className="font-medium">{item.level || "-"}</span></p>
              <p className="text-slate-400 text-xs mt-1">Source: {item.type || item.source}</p>
              <p className="text-slate-500 text-xs mt-1">Last Updated: {item.lastUpdated || "-"}</p>

              {/* Assign Worker */}
              <div className="mt-3">
                <label className="text-slate-300 text-sm">Assign Worker:</label>
                <select
                  className="w-full mt-1 p-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none"
                  value={item.worker || ""}
                  onChange={(e) => assignWorker(index, e.target.value)}
                >
                  <option value="">Select</option>
                  {workers.map((w, idx) => (
                    <option key={w.id || idx} value={w.id || w}>
                      {w.name || w}
                    </option>
                  ))}
                </select>
                {item.worker && <p className="text-slate-300 mt-1 text-sm">Assigned to: {workers.find(w => w.id === item.worker)?.name || item.worker}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
