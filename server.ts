import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/auth.ts";
import billRoutes from "./src/routes/billRoutes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database Connection - Non-blocking
  const MONGODB_URI = process.env.MONGODB_URI;
  let isDemoMode = false;
  
  if (MONGODB_URI) {
    console.log("Attempting to connect to MongoDB...");
    mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Faster timeout
    })
      .then(() => console.log("Connected to MongoDB successfully"))
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        console.warn("Falling back to Demo Mode for this session.");
        isDemoMode = true;
      });
  } else {
    console.warn("MONGODB_URI missing. Using Demo Mode.");
    isDemoMode = true;
  }

  // Inject status to routes - using a getter to be reactive if mode changes
  app.use((req, res, next) => {
    (req as any).isDemoMode = isDemoMode;
    next();
  });

  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/bills", billRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Bill Samjho API is running", mode: isDemoMode ? "demo" : "db" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Catch-all to serve index.html via Vite
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
