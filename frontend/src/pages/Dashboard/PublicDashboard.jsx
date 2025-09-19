import React, { useEffect, useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function PublicDashboard() {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [villageInfo, setVillageInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user information from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.assigned_village) {
        throw new Error('User village information not found. Please log in again.');
      }

      // Fetch all data for the user's village
      const response = await fetch(`/api/public/my-village-data?village_id=${user.assigned_village}`);
      if (!response.ok) throw new Error('Failed to fetch village data');
      
      const villageData = await response.json();
      
      setVillageInfo(villageData.village);
      setData(villageData.waterBodies);
      setAlerts(villageData.alerts);
      setSummary(villageData.summary);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper for alert risk color (text only)
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  // Helper for alert risk background (border/bg)
  const getRiskLevelBg = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-slate-500 bg-slate-900/20';
    }
  };

  // Helper for water status color (badge)
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'contaminated': return 'text-red-400 bg-red-900/20';
      case 'safe': return 'text-emerald-400 bg-emerald-900/20';
      default: return 'text-yellow-400 bg-yellow-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <Sidebar role="public" data={data} />
        <div className="flex-1 p-6">
          <Navbar title="Public Dashboard" />
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar role="public" data={data} />

      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Public Dashboard" />

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg">
            Error: {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Village Information */}
        {villageInfo && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Your Village</h2>
            <p className="text-slate-300">
              <span className="font-medium">{villageInfo.name}</span>
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-slate-300 text-sm">Total Water Sources</h3>
              <p className="text-2xl font-bold text-blue-400">{summary.total}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-slate-300 text-sm">Safe Sources</h3>
              <p className="text-2xl font-bold text-green-400">{summary.safe}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-slate-300 text-sm">Contaminated Sources</h3>
              <p className="text-2xl font-bold text-red-400">{summary.contaminated}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-slate-300 text-sm">Active Alerts</h3>
              <p className="text-2xl font-bold text-yellow-400">{alerts.length}</p>
            </div>
          </div>
        )}

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Recent Water Alerts</h2>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getRiskLevelBg(alert.risk_level)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{alert.alert_type || 'Water Quality Alert'}</h3>
                      <p className="text-slate-300 text-sm">Risk Level: 
                        <span className={`ml-1 font-semibold ${getRiskLevelColor(alert.risk_level)}`}>
                          {alert.risk_level}
                        </span>
                      </p>
                      {alert.likely_disease && alert.likely_disease !== 'None' && (
                        <p className="text-slate-300 text-sm">Likely Disease: 
                          <span className="ml-1 font-semibold text-red-400">
                            {alert.likely_disease}
                          </span>
                        </p>
                      )}
                      {alert.water_body_id && (
                        <p className="text-slate-300 text-xs mt-1">Water Body ID: {alert.water_body_id}</p>
                      )}
                    </div>
                    <span className="text-slate-400 text-xs">{alert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Water Quality Status Table */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Water Quality Status</h2>
          {data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-slate-300">
                    <th className="text-left p-3">Water Source</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Arsenic (mg/L)</th>
                    <th className="text-left p-3">Lead (mg/L)</th>
                    <th className="text-left p-3">Nitrates (mg/L)</th>
                    <th className="text-left p-3">Bacteria (CFU)</th>
                    <th className="text-left p-3">Last Tested</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((record, index) => (
                    <tr
                      key={`${record.name}-${index}`}
                      className="border-t border-slate-700 hover:bg-slate-700/40"
                    >
                      <td className="p-3 font-medium">{record.name}</td>
                      <td className="p-3 text-slate-300">{record.type || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(record.status)}`}
                        >
                          {record.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3">
                        {record.arsenic !== null && record.arsenic !== undefined ? (
                          <span className={
                            parseFloat(record.arsenic) > 0.01 
                              ? 'text-red-400' : 'text-green-400'
                          }>
                            {parseFloat(record.arsenic).toFixed(4)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        {record.lead !== null && record.lead !== undefined ? (
                          <span className={
                            parseFloat(record.lead) > 0.015 ? 'text-red-400' : 'text-green-400'
                          }>
                            {parseFloat(record.lead).toFixed(4)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        {record.nitrates !== null && record.nitrates !== undefined ? (
                          <span className={
                            parseFloat(record.nitrates) > 50 ? 'text-red-400' : 'text-green-400'
                          }>
                            {parseFloat(record.nitrates).toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        {record.bacteria !== null && record.bacteria !== undefined ? (
                          <span className={
                            parseFloat(record.bacteria) > 100 ? 'text-red-400' : 'text-green-400'
                          }>
                            {parseFloat(record.bacteria).toFixed(0)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-slate-400 text-sm">{record.last_updated || record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              {villageInfo ? "No water quality data available for your village." : "Loading village data..."}
            </div>
          )}
        </div>

        {/* Safety Guidelines */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Water Safety Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-400">Safe Levels:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Arsenic: Below 0.01 mg/L</li>
                <li>• Lead: Below 0.015 mg/L</li>
                <li>• Nitrates: Below 50 mg/L</li>
                <li>• Bacteria: Below 100 CFU</li>
                <li>• Mercury: Below 0.002 mg/L</li>
                <li>• Cadmium: Below 0.005 mg/L</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-red-400">Contamination Signs:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• High heavy metal levels</li>
                <li>• Bacterial contamination</li>
                <li>• Chemical pollutants detected</li>
                <li>• Unusual taste, odor, or color</li>
                <li>• Industrial discharge nearby</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-blue-300">
              <strong>Important:</strong> If you notice contaminated water sources or experience water-related health issues, 
              please contact your local health worker or village authorities immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
