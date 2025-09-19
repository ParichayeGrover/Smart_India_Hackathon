import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}



// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import Reports from "./pages/Reports";
// import Alerts from "./pages/Alerts";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";

// function App() {
//   return (
//     <BrowserRouter>
//       <div className="flex h-screen w-screen">
//         {" "}
//         {/* full screen */}
//         <Sidebar />
//         <div className="flex flex-col flex-1">
//           {" "}
//           {/* take remaining width */}
//           <Navbar />
//           <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
//             <Routes>
//               <Route path="/" element={<Dashboard />} />
//               <Route path="/reports" element={<Reports />} />
//               <Route path="/alerts" element={<Alerts />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//             </Routes>
//           </main>
//         </div>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;
