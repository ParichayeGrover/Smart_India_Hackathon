import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../components/Auth/LoginForm";

export default function PublicLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md">
        <LoginForm title="Public Login" accent="slate" />
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link 
              to="/register/public" 
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
