import React, { useEffect, useState } from "react";
import Navbar from "../../components/Layout/Navbar";
import Sidebar from "../../components/Layout/Sidebar";

// Inline WorkerAssignmentSection component
function WorkerAssignmentSection({ selectedVillage, workers, waterBodies, onAssignmentChange }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedWaterBody, setSelectedWaterBody] = useState('');

  // Filter workers to show only those from the selected village
  const availableWorkers = selectedVillage 
    ? workers.filter(worker => worker.assigned_village == selectedVillage)
    : workers;

  useEffect(() => {
    if (selectedVillage) {
      fetchAssignments();
    }
  }, [selectedVillage]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/assignments?village_id=${selectedVillage}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !selectedWaterBody) return;

    try {
      const response = await fetch('/api/admin/assign-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          worker_id: selectedWorker, 
          water_body_id: selectedWaterBody 
        })
      });

      if (response.ok) {
        setSelectedWorker('');
        setSelectedWaterBody('');
        fetchAssignments();
        onAssignmentChange();
      } else {
        throw new Error('Failed to assign worker');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Worker Assignments</h2>
      
      {/* Assignment Form */}
      <form onSubmit={handleAssignWorker} className="mb-6 grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 text-sm mb-2">Select Worker</label>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          >
            <option value="">
              {availableWorkers.length > 0 
                ? "Choose a worker..." 
                : selectedVillage 
                  ? "No workers available for this village" 
                  : "Please select a village first"
              }
            </option>
            {availableWorkers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                ID: {worker.id} - {worker.name} ({worker.contact})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm mb-2">Select Water Body</label>
          <select
            value={selectedWaterBody}
            onChange={(e) => setSelectedWaterBody(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          >
            <option value="">Choose a water body...</option>
            {waterBodies.map((wb) => (
              <option key={wb.id} value={wb.id}>
                {wb.name} ({wb.type})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105"
          >
            Assign Worker
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
          Error: {error}
          <button onClick={() => setError(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Current Assignments */}
      <div>
        <h3 className="text-md font-semibold mb-3">Current Assignments</h3>
        {loading ? (
          <div className="text-slate-400">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-slate-400">No worker assignments found.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-3 rounded-lg bg-slate-700 border border-slate-600">
                <div className="font-semibold text-emerald-400">{assignment.worker_name}</div>
                <div className="text-slate-300 text-sm">{assignment.water_body_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline WorkerCreationSection component
function WorkerCreationSection({ villages, onWorkerCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    assigned_village: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/create-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Worker "${data.worker.name}" created successfully!`);
        setFormData({ name: '', email: '', contact: '', assigned_village: '', password: '' });
        onWorkerCreated(); // Refresh workers list
      } else {
        setError(data.error || 'Failed to create worker');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Create New Worker</h2>
      
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm mb-2">Worker Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">Contact Number *</label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="Phone number"
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">Assigned Village *</label>
          <select
            name="assigned_village"
            value={formData.assigned_village}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Select village...</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.name}, {village.district}, {village.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            required
            minLength="6"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105 ${
              loading 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Creating...' : 'Create Worker'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mt-4">
          Error: {error}
          <button onClick={() => setError(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-600 text-white p-3 rounded-lg mt-4">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// Inline WorkerManagementSection component
function WorkerManagementSection({ workers, selectedVillage, onWorkerDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDeleteWorker = async (workerId, workerName) => {
    if (!confirm(`Are you sure you want to delete worker "${workerName}"? This will remove all their assignments.`)) {
      return;
    }

    setDeletingId(workerId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/delete-worker/${workerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(`Worker "${workerName}" deleted successfully`);
        onWorkerDeleted();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete worker');
      }
    } catch (err) {
      setError('Failed to delete worker');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter workers by selected village if needed
  const filteredWorkers = selectedVillage 
    ? workers.filter(worker => worker.assigned_village == selectedVillage)
    : workers;

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Worker Management</h2>
      
      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-600 text-white p-3 rounded-lg mb-4">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {filteredWorkers.length > 0 ? (
        <div className="space-y-3">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-100">
                  ID: {worker.id} - {worker.name}
                </h3>
                <p className="text-slate-300 text-sm">Contact: {worker.contact}</p>
                <p className="text-slate-400 text-xs">Village ID: {worker.assigned_village}</p>
              </div>
              <button
                onClick={() => handleDeleteWorker(worker.id, worker.name)}
                disabled={deletingId === worker.id}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {deletingId === worker.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-4">
          {selectedVillage ? "No workers found for this village." : "No workers found."}
        </p>
      )}
    </div>
  );
}

// Inline WaterBodyCreationSection component
function WaterBodyCreationSection({ villages, selectedVillage, onWaterBodyCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    village_id: selectedVillage || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update village_id when selectedVillage changes
  useEffect(() => {
    if (selectedVillage) {
      setFormData(prev => ({
        ...prev,
        village_id: selectedVillage
      }));
    }
  }, [selectedVillage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/create-water-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Water body "${data.waterBody.name}" created successfully!`);
        setFormData({ name: '', type: '', village_id: selectedVillage || '' });
        onWaterBodyCreated(); // Refresh water bodies list
      } else {
        setError(data.error || 'Failed to create water body');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const waterBodyTypes = [
    'Well', 'Borewell', 'Pond', 'Lake', 'River', 'Stream', 'Tank', 
    'Reservoir', 'Spring', 'Canal', 'Other'
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Add New Water Body</h2>
      
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 text-sm mb-2">Water Body Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Central Village Well"
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Select type...</option>
            {waterBodyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">Village *</label>
          <select
            name="village_id"
            value={formData.village_id}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">Select village...</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.name}, {village.district}, {village.state}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105 ${
              loading 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
          >
            {loading ? 'Creating...' : 'Add Water Body'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mt-4">
          Error: {error}
          <button onClick={() => setError(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-600 text-white p-3 rounded-lg mt-4">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// Inline AdminAlerts component
function AdminAlertsInline({ selectedVillage }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = '/api/admin/alerts';
    if (selectedVillage) url += '?village_id=' + selectedVillage;
    
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch alerts'))
      .then(setAlerts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [selectedVillage]);

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl mt-8">
      <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
      {loading ? (
        <div className="text-slate-400">Loading alerts...</div>
      ) : error ? (
        <div className="text-red-400">Error: {error}</div>
      ) : alerts.length === 0 ? (
        <div className="text-slate-400">No alerts found.</div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 10).map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.risk_level === 'High' ? 'border-red-500 bg-red-900/20' :
                alert.risk_level === 'Medium' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-green-500 bg-green-900/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{alert.alert_type || 'Water Quality Alert'}</h3>
                  <p className="text-slate-300 text-sm">Risk Level: 
                    <span className={`ml-1 font-semibold ${
                      alert.risk_level === 'High' ? 'text-red-400' :
                      alert.risk_level === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
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
      )}
    </div>
  );
}

function AdminDashboard() {
  const [contaminationData, setContaminationData] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (villageId = '') => {
    try {
      setLoading(true);
      setError(null);

      let waterBodiesUrl = '/api/admin/water-bodies';
      if (villageId) waterBodiesUrl += '?village_id=' + villageId;
      
      const waterBodiesRes = await fetch(waterBodiesUrl);
      if (!waterBodiesRes.ok) throw new Error('Failed to fetch water bodies data');
      const waterBodiesData = await waterBodiesRes.json();
      setContaminationData(waterBodiesData);

      let workersUrl = '/api/admin/workers';
      if (villageId) workersUrl += '?village_id=' + villageId;
      
      const workersRes = await fetch(workersUrl);
      let workersData = [];
      if (workersRes.ok) {
        workersData = await workersRes.json();
        setWorkers(workersData);
      } else {
        console.warn('Failed to fetch workers:', workersRes.status, workersRes.statusText);
        setWorkers([]);
      }

      const stats = {
        totalWaterBodies: waterBodiesData.length,
        safeWaterBodies: waterBodiesData.filter(item => item.status === 'Safe').length,
        contaminatedWaterBodies: waterBodiesData.filter(item => item.status === 'Contaminated').length,
        totalWorkers: workersData.length
      };
      setDashboardStats(stats);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const villagesRes = await fetch('/api/villages');
        if (villagesRes.ok) {
          const villagesData = await villagesRes.json();
          setVillages(villagesData);
          if (villagesData.length > 0) {
            setSelectedVillage(villagesData[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching villages:', err);
      }
    };

    fetchVillages();
  }, []);

  useEffect(() => {
    if (selectedVillage) {
      fetchData(selectedVillage);
    }
  }, [selectedVillage]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <Sidebar role="admin" data={contaminationData} stats={dashboardStats} />
        <div className="flex-1 p-6">
          <Navbar title="Admin Dashboard" />
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar role="admin" data={contaminationData} stats={dashboardStats} />
      <div className="flex-1 p-6 space-y-6">
        <Navbar title="Admin Dashboard" />
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg">
            Error: {error}
            <button onClick={() => setError(null)} className="ml-4 text-sm underline">
              Dismiss
            </button>
          </div>
        )}
        <div className="bg-slate-800 p-4 rounded-lg">
          <label htmlFor="village-select" className="block text-slate-300 text-sm mb-2">Filter by Village:</label>
          <select
            id="village-select"
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="bg-slate-700 text-slate-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Villages</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.name}, {village.district}, {village.state}
              </option>
            ))}
          </select>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-slate-300 text-sm">Total Water Bodies</h3>
            <p className="text-3xl font-bold text-blue-400">{dashboardStats.totalWaterBodies || 0}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-slate-300 text-sm">Safe Water Bodies</h3>
            <p className="text-3xl font-bold text-green-400">{dashboardStats.safeWaterBodies || 0}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-slate-300 text-sm">Contaminated Sources</h3>
            <p className="text-3xl font-bold text-red-400">{dashboardStats.contaminatedWaterBodies || 0}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-slate-300 text-sm">Active Workers</h3>
            <p className="text-3xl font-bold text-yellow-400">{dashboardStats.totalWorkers || 0}</p>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Water Bodies Overview</h2>
          {contaminationData.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contaminationData.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-l-4 ${ 
                    item.status === 'Contaminated' ? 'border-red-500 bg-red-900/20' :
                    item.status === 'Safe' ? 'border-green-500 bg-green-900/20' :
                    'border-yellow-500 bg-yellow-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.name || item.area}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'Contaminated' ? 'bg-red-600 text-red-100' :
                        item.status === 'Safe' ? 'bg-green-600 text-green-100' :
                        'bg-yellow-600 text-yellow-100'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{item.village_name}</p>
                  <p className="text-slate-400 text-xs">Last Updated: {item.date}</p>
                  {item.assigned_worker_name && (
                    <p className="text-slate-300 mt-1 text-sm">
                      Assigned to: {item.assigned_worker_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              {selectedVillage ? "No water bodies found for this village." : "Please select a village to view data."}
            </div>
          )}
        </div>

        {/* Worker Assignment Section */}
        <WorkerAssignmentSection 
          selectedVillage={selectedVillage} 
          workers={workers}
          waterBodies={contaminationData}
          onAssignmentChange={() => fetchData(selectedVillage)}
        />

        {/* Worker Creation Section */}
        <WorkerCreationSection 
          villages={villages}
          onWorkerCreated={() => fetchData(selectedVillage)}
        />

        {/* Worker Management Section */}
        <WorkerManagementSection 
          workers={workers}
          selectedVillage={selectedVillage}
          onWorkerDeleted={() => fetchData(selectedVillage)}
        />

        {/* Water Body Creation Section */}
        <WaterBodyCreationSection 
          villages={villages}
          selectedVillage={selectedVillage}
          onWaterBodyCreated={() => fetchData(selectedVillage)}
        />

        {/* Alerts Section */}
        <AdminAlertsInline selectedVillage={selectedVillage} />
      </div>
    </div>
  );
}

export default AdminDashboard;
