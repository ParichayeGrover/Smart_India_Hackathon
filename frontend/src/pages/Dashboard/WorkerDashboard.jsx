import React, { useEffect, useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

export default function WorkerDashboard() {
  const [assignedAreas, setAssignedAreas] = useState([]);
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workerId, setWorkerId] = useState(null);
  
  // Form state for all water quality parameters (20 features)
  const [formData, setFormData] = useState({
    water_body_id: '',
    date: new Date().toISOString().split('T')[0],
    aluminium: '',
    ammonia: '',
    arsenic: '',
    barium: '',
    cadmium: '',
    chloramine: '',
    chromium: '',
    copper: '',
    flouride: '',
    bacteria: '',
    viruses: '',
    lead: '',
    nitrates: '',
    nitrites: '',
    mercury: '',
    perchlorate: '',
    radium: '',
    selenium: '',
    silver: '',
    uranium: ''
  });

  // Get worker ID from localStorage on component mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId || userRole !== 'worker') {
      setError('You must be logged in as a worker to access this page');
      return;
    }
    
    setWorkerId(userId);
  }, []);

  const fetchData = async () => {
    if (!workerId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch assigned water bodies
      const areasRes = await fetch(`/api/worker/water-bodies?worker_id=${workerId}`);
      if (!areasRes.ok) throw new Error('Failed to fetch assigned areas');
      const areas = await areasRes.json();
      setAssignedAreas(areas);

      // Fetch water quality records
      const recordsRes = await fetch(`/api/worker/water-quality?worker_id=${workerId}`);
      if (!recordsRes.ok) throw new Error('Failed to fetch water quality records');
      const records = await recordsRes.json();
      setData(records);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workerId) {
      fetchData();
    }
  }, [workerId]);

  const resetForm = () => {
    setFormData({
      water_body_id: '',
      date: new Date().toISOString().split('T')[0],
      aluminium: '',
      ammonia: '',
      arsenic: '',
      barium: '',
      cadmium: '',
      chloramine: '',
      chromium: '',
      copper: '',
      flouride: '',
      bacteria: '',
      viruses: '',
      lead: '',
      nitrates: '',
      nitrites: '',
      mercury: '',
      perchlorate: '',
      radium: '',
      selenium: '',
      silver: '',
      uranium: ''
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.water_body_id) {
      setError('Please select a water body');
      return;
    }

    try {
      setError(null);
      
      const url = editingId 
        ? `/api/worker/water-quality/${editingId}` 
        : "/api/worker/water-quality";
      
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? 'update' : 'add'} record`);
      }

      // Refresh data and reset form
      await fetchData();
      resetForm();
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      water_body_id: record.water_body_id,
      date: record.date || new Date().toISOString().split('T')[0],
      aluminium: record.aluminium || '',
      ammonia: record.ammonia || '',
      arsenic: record.arsenic || '',
      barium: record.barium || '',
      cadmium: record.cadmium || '',
      chloramine: record.chloramine || '',
      chromium: record.chromium || '',
      copper: record.copper || '',
      flouride: record.flouride || '',
      bacteria: record.bacteria || '',
      viruses: record.viruses || '',
      lead: record.lead || '',
      nitrates: record.nitrates || '',
      nitrites: record.nitrites || '',
      mercury: record.mercury || '',
      perchlorate: record.perchlorate || '',
      radium: record.radium || '',
      selenium: record.selenium || '',
      silver: record.silver || '',
      uranium: record.uranium || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/worker/water-quality/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) throw new Error('Failed to delete record');
      
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'contaminated': return 'text-red-400';
      case 'safe': return 'text-emerald-400';
      default: return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <Sidebar role="worker" data={assignedAreas} />
        <div className="flex-1 p-6">
          <Navbar title="Worker Dashboard" />
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar role="worker" data={assignedAreas} />

      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Worker Dashboard" />

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

        {/* Water Quality Reports Table */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Water Quality Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-slate-300 text-sm">
                  <th className="text-left p-2">Water Body</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Arsenic</th>
                  <th className="text-left p-2">Lead</th>
                  <th className="text-left p-2">Nitrates</th>
                  <th className="text-left p-2">Bacteria</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-slate-700 hover:bg-slate-700/40"
                  >
                    <td className="p-2">{record.water_body_name}</td>
                    <td className={`p-2 font-semibold ${getStatusColor(record.status)}`}>
                      {record.status}
                    </td>
                    <td className="p-2">{record.date}</td>
                    <td className="p-2">{record.arsenic ? parseFloat(record.arsenic).toFixed(3) : '-'}</td>
                    <td className="p-2">{record.lead ? parseFloat(record.lead).toFixed(3) : '-'}</td>
                    <td className="p-2">{record.nitrates ? parseFloat(record.nitrates).toFixed(1) : '-'}</td>
                    <td className="p-2">{record.bacteria ? parseFloat(record.bacteria).toFixed(0) : '-'}</td>
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
            {data.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                No water quality reports found. Add your first report below.
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Water Quality Report" : "Add New Water Quality Report"}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Water Body Selection */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-slate-300 text-sm mb-2">Water Body *</label>
              <select
                name="water_body_id"
                value={formData.water_body_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Select Assigned Water Body</option>
                {assignedAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} ({area.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Aluminium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Aluminium (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="aluminium"
                value={formData.aluminium}
                onChange={handleInputChange}
                placeholder="< 0.2 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Ammonia */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Ammonia (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="ammonia"
                value={formData.ammonia}
                onChange={handleInputChange}
                placeholder="< 0.5 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Arsenic */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Arsenic (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="arsenic"
                value={formData.arsenic}
                onChange={handleInputChange}
                placeholder="< 0.01 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Barium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Barium (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="barium"
                value={formData.barium}
                onChange={handleInputChange}
                placeholder="< 2.0 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Cadmium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Cadmium (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="cadmium"
                value={formData.cadmium}
                onChange={handleInputChange}
                placeholder="< 0.005 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Chloramine */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Chloramine (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="chloramine"
                value={formData.chloramine}
                onChange={handleInputChange}
                placeholder="< 4.0 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Chromium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Chromium (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="chromium"
                value={formData.chromium}
                onChange={handleInputChange}
                placeholder="< 0.1 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Copper */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Copper (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="copper"
                value={formData.copper}
                onChange={handleInputChange}
                placeholder="< 1.3 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Flouride */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Fluoride (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="flouride"
                value={formData.flouride}
                onChange={handleInputChange}
                placeholder="< 1.5 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Bacteria */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Bacteria (CFU/ml)</label>
              <input
                type="number"
                step="1"
                min="0"
                name="bacteria"
                value={formData.bacteria}
                onChange={handleInputChange}
                placeholder="< 100 CFU/ml normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Viruses */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Viruses (PFU/ml)</label>
              <input
                type="number"
                step="1"
                min="0"
                name="viruses"
                value={formData.viruses}
                onChange={handleInputChange}
                placeholder="0 PFU/ml normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Lead */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Lead (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="lead"
                value={formData.lead}
                onChange={handleInputChange}
                placeholder="< 0.015 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Nitrates */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Nitrates (mg/L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="nitrates"
                value={formData.nitrates}
                onChange={handleInputChange}
                placeholder="< 50 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Nitrites */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Nitrites (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="nitrites"
                value={formData.nitrites}
                onChange={handleInputChange}
                placeholder="< 1.0 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Mercury */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Mercury (mg/L)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                name="mercury"
                value={formData.mercury}
                onChange={handleInputChange}
                placeholder="< 0.002 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Perchlorate */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Perchlorate (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="perchlorate"
                value={formData.perchlorate}
                onChange={handleInputChange}
                placeholder="< 0.015 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Radium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Radium (pCi/L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="radium"
                value={formData.radium}
                onChange={handleInputChange}
                placeholder="< 5.0 pCi/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Selenium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Selenium (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="selenium"
                value={formData.selenium}
                onChange={handleInputChange}
                placeholder="< 0.05 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Silver */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Silver (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="silver"
                value={formData.silver}
                onChange={handleInputChange}
                placeholder="< 0.1 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Uranium */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Uranium (mg/L)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="uranium"
                value={formData.uranium}
                onChange={handleInputChange}
                placeholder="< 0.03 mg/L normal"
                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-4">
              <button
                type="submit"
                className={`${
                  editingId
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                } text-white px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105`}
              >
                {editingId ? "Update Report" : "Add Report"}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg shadow-md transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {assignedAreas.length === 0 && (
          <div className="text-center text-slate-400 mt-8">
            No water bodies assigned to you. Please contact your administrator.
          </div>
        )}
      </div>
    </div>
  );
}
