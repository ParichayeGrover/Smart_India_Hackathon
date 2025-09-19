import { useState } from "react";
import React from "react";

export default function Reports() {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    village: "",
    symptoms: "",
    waterSource: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Report Submitted:", formData);
    // later: send to backend API
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">
        Report a Case
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />
        <input
          type="text"
          name="village"
          placeholder="Village"
          value={formData.village}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />
        <textarea
          name="symptoms"
          placeholder="Symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />
        <select
          name="waterSource"
          value={formData.waterSource}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        >
          <option value="">Select Water Source</option>
          <option value="Well">Well</option>
          <option value="River">River</option>
          <option value="Pond">Pond</option>
          <option value="Tap">Tap</option>
        </select>
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Submit Report
        </button>
      </form>
    </div>
  );
}
