import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/auth.ts";
import billRoutes from "./src/routes/billRoutes.ts";
import dotenv from "dotenv";

dotenv.config();

const app = express(); // moved outside
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isDemoMode = false;

// middlewares
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  (req as any).isDemoMode = isDemoMode;
  next();
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Bill Samjho API is running",
    mode: isDemoMode ? "demo" : "db",
  });
});

async function startServer() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB successfully");
    } catch (err: any) {
      console.log("MongoDB failed:", err.message);
      isDemoMode = true;
    }
  } else {
    isDemoMode = true;
  }

  // only for local development
if (process.env.NODE_ENV !== "production") {
   app.listen(PORT, () => {
      console.log(`Running on ${PORT}`);
   });
}
}

startServer();

// export for vercel
export default app;