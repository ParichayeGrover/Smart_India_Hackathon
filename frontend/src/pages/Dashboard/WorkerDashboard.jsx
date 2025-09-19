import React, { useEffect, useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function WorkerDashboard() {

  const [assignedAreas, setAssignedAreas] = useState([]); // fetched from backend
  const [data, setData] = useState([]); // contamination records
  const [newArea, setNewArea] = useState("");
  const [newStatus, setNewStatus] = useState("Safe");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Fetch assigned water bodies for this worker
    fetch("/api/worker/water-bodies")
      .then((res) => res.json())
      .then((areas) => setAssignedAreas(areas))
      .catch(() => setAssignedAreas([]));

    // Fetch contamination records for assigned water bodies
    fetch("/api/worker/water-quality")
      .then((res) => res.json())
      .then((records) => setData(records))
      .catch(() => setData([]));
  }, []);

  // Add or Update record

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newArea || !assignedAreas.find(a => a.name === newArea || a.id === newArea)) return;

    if (editingId) {
      // Update record in backend
      fetch(`/api/worker/water-quality/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: newArea, status: newStatus }),
      })
        .then((res) => res.json())
        .then(() => {
          // Refresh data
          fetch("/api/worker/water-quality")
            .then((res) => res.json())
            .then((records) => setData(records));
        });
      setEditingId(null);
    } else {
      // Add new record in backend
      fetch("/api/worker/water-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: newArea, status: newStatus }),
      })
        .then((res) => res.json())
        .then(() => {
          // Refresh data
          fetch("/api/worker/water-quality")
            .then((res) => res.json())
            .then((records) => setData(records));
        });
    }

    setNewArea("");
    setNewStatus("Safe");
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setNewArea(record.area);
    setNewStatus(record.status);
  };

  const handleDelete = (id) => {
    // Delete record in backend
    fetch(`/api/worker/water-quality/${id}`, { method: "DELETE" })
      .then(() => {
        // Refresh data
        fetch("/api/worker/water-quality")
          .then((res) => res.json())
          .then((records) => setData(records));
      });
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar role="worker" />

      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Worker Dashboard" />

        {/* Contamination Data Table */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Assigned Water Contamination Areas</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-slate-300">
                <th className="text-left p-2">Area</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((rec) => assignedAreas.includes(rec.area))
                .map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-slate-700 hover:bg-slate-700/40"
                  >
                    <td className="p-2">{record.area}</td>
                    <td
                      className={`p-2 font-semibold ${
                        record.status === "Contaminated"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {record.status}
                    </td>
                    <td className="p-2">{record.date}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 rounded-lg text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-lg text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Record" : "Add New Record"}
          </h2>
          <form onSubmit={handleAddRecord} className="flex flex-col md:flex-row gap-4">
            <select
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Select Assigned Area</option>
              {assignedAreas.map((area, idx) => (
                <option key={area.id || idx} value={area.name || area.id}>
                  {area.name || area}
                </option>
              ))}
            </select>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="Safe">Safe</option>
              <option value="Contaminated">Contaminated</option>
            </select>
            <button
              type="submit"
              className={`${
                editingId
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              } text-white px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105`}
            >
              {editingId ? "Update" : "Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
