import "dotenv/config";
import express from "express";
import cors from "cors";

import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import transactions from "./routes/transactions.js";
import budget from "./routes/budget.js";
import analytics from "./routes/analytics.js";
import exportRoutes from "./routes/export.js";

const app = express();

const origins = (process.env.CLIENT_URL || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/transactions", requireAuth, transactions);
app.use("/api/budget", requireAuth, budget);
app.use("/api/analytics", requireAuth, analytics);
app.use("/api/export", requireAuth, exportRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

export default app;
