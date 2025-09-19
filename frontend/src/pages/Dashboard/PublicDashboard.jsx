import React, { useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function PublicDashboard() {
  // Sample contamination data
  const [data] = useState([
    { id: 1, area: "Sector 12", status: "Contaminated", date: "2025-09-15" },
    { id: 2, area: "Sector 8", status: "Safe", date: "2025-09-16" },
    { id: 3, area: "Sector 5", status: "Contaminated", date: "2025-09-17" },
  ]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar role="public" data={data} />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Public Dashboard" />

        {/* Contamination Data */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Water Contamination Status</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-slate-300">
                <th className="text-left p-2">Area</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
