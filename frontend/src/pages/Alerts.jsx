import React from "react";
import { useState } from "react";

export default function Alerts() {
  const [alerts] = useState([
    { id: 1, village: "Village A", type: "Cholera", severity: "High" },
    { id: 2, village: "Village B", type: "Dysentery", severity: "Medium" },
  ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-red-600">
        Active Alerts 🚨
      </h2>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-bold">{alert.type}</h3>
              <p>Village: {alert.village}</p>
              <p
                className={`font-semibold ${
                  alert.severity === "High" ? "text-red-600" : "text-yellow-600"
                }`}
              >
                Severity: {alert.severity}
              </p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Mark Resolved
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
