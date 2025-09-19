import React from "react";
import LoginForm from "../../components/Auth/LoginForm";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <LoginForm
        title="Admin Login"
        accent="emerald"
        defaultUsername="admin"
        defaultPassword="admin123"
        redirectTo="/dashboard/admin"
      />
    </div>
  );
}
