import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AdminLogin from "../pages/Login/AdminLogin";
import WorkerLogin from "../pages/Login/WorkerLogin";
import PublicLogin from "../pages/Login/PublicLogin";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import WorkerDashboard from "../pages/Dashboard/WorkerDashboard";
import PublicDashboard from "../pages/Dashboard/PublicDashboard";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/worker" element={<WorkerLogin />} />
      <Route path="/login/public" element={<PublicLogin />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/dashboard/worker" element={<WorkerDashboard />} />
      <Route path="/dashboard/public" element={<PublicDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
