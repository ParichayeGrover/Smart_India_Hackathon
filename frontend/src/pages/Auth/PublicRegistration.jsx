import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function PublicRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    assigned_village: '',
    password: '',
    confirmPassword: ''
  });
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch villages for the dropdown
    const fetchVillages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/villages');
        if (response.ok) {
          const villagesData = await response.json();
          setVillages(villagesData);
        } else {
          console.error('Failed to fetch villages');
          setError('Failed to load villages. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching villages:', err);
        setError('Network error while loading villages. Please check your connection.');
      }
    };

    fetchVillages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.contact || !formData.assigned_village || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          assigned_village: formData.assigned_village,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          name: '',
          email: '',
          contact: '',
          assigned_village: '',
          password: '',
          confirmPassword: ''
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login/public');
        }, 3000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Public Registration</h1>
          <p className="text-slate-400">Join your village community health monitoring</p>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-3 rounded-lg mb-4 text-sm">
            {success}
            <p className="mt-1 text-xs">Redirecting to login page...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full-name" className="block text-slate-300 text-sm mb-2">Full Name</label>
            <input
              id="full-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-slate-300 text-sm mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div>
            <label htmlFor="contact-number" className="block text-slate-300 text-sm mb-2">Contact Number</label>
            <input
              id="contact-number"
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label htmlFor="village-select" className="block text-slate-300 text-sm mb-2">Select Your Village</label>
            <select
              id="village-select"
              name="assigned_village"
              value={formData.assigned_village}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Choose your village...</option>
              {villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}, {village.district}, {village.state}
                </option>
              ))}
            </select>
            {villages.length === 0 && (
              <p className="text-slate-400 text-xs mt-1">Loading villages...</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-slate-300 text-sm mb-2">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-slate-300 text-sm mb-2">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500 text-slate-100 font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login/public" className="text-blue-400 hover:text-blue-300">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}