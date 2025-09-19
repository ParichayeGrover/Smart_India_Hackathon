import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
import patientRoutes from "./routes/patients.js";
import readingRoutes from "./routes/readings.js";

app.use("/api/patients", patientRoutes);
app.use("/api/readings", readingRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
