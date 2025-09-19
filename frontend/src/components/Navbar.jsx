import React from "react";
export default function Navbar() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center w-full">
      <h1 className="text-xl font-bold text-blue-600">
        Smart Health Monitoring
      </h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Logout
      </button>
    </header>
  );
}
