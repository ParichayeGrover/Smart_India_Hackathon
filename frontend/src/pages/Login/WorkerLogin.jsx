import React from "react";

import LoginForm from "../../components/Auth/LoginForm";

export default function WorkerLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <LoginForm title="Worker Login" accent="amber" />
    </div>
  );
}
