import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import workerRoutes from "./routes/worker.js";
import publicRoutes from "./routes/public.js";
import sharedRoutes from "./routes/shared.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection
pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/public", publicRoutes);
app.use("/api", sharedRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
