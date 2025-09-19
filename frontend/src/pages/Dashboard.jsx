import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", cases: 30 },
  { month: "Feb", cases: 45 },
  { month: "Mar", cases: 20 },
  { month: "Apr", cases: 60 },
  { month: "May", cases: 35 },
];

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-6 bg-white shadow rounded-lg">📊 Total Reports</div>
        <div className="p-6 bg-white shadow rounded-lg">⚠️ Active Alerts</div>
        <div className="p-6 bg-white shadow rounded-lg">✅ Resolved Cases</div>
      </div>
      <div className="p-6 bg-white shadow rounded-lg">
        <h3 className="text-lg font-bold mb-4">Monthly Cases Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
