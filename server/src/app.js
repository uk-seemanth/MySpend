import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import transactions from "./routes/transactions.js";
import budget from "./routes/budget.js";
import analytics from "./routes/analytics.js";
import exportRoutes from "./routes/export.js";

const app = express();

// ── Startup env validation ────────────────────────────────────
function validateEnv() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  const checkVar = (name, val, placeholders = []) => {
    let issue = null;
    if (!val || !val.trim()) {
      issue = "is missing or empty";
    } else if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      issue = "is wrapped in quotes";
    } else if (/\s/.test(val)) {
      issue = "contains whitespace";
    } else if (placeholders.some((p) => val.includes(p))) {
      issue = "still contains placeholder values";
    }

    if (issue) {
      // ANSI escape \x1b[31m for red text, \x1b[0m to reset
      console.warn(`\x1b[31m[WARNING] Environment variable ${name} ${issue}!\x1b[0m`);
    }
  };

  checkVar("SUPABASE_URL", url, ["YOUR-PROJECT"]);
  checkVar("SUPABASE_ANON_KEY", key, ["your-anon", "YOUR-PROJECT"]);

  let host = "unknown";
  try {
    host = url ? new URL(url).host : "missing";
  } catch {
    host = "invalid URL";
  }

  const keyLen = key ? key.length : 0;
  const keyFirst6 = key ? key.slice(0, 6) : "";

  console.log(`[startup] Supabase URL host: ${host}`);
  console.log(`[startup] Supabase key length: ${keyLen}, first 6 chars: ${keyFirst6}`);
}
validateEnv();

// ── CORS configuration ────────────────────────────────────────
const clientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set(["http://localhost:5173", "http://127.0.0.1:5173", ...clientUrls])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, etc.) or in allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// REMOVE BEFORE DEPLOY
app.get("/api/debug/auth-check", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.json({ error: "No Bearer token in request" });

  // Decode JWT payload without verification (base64url)
  let payload = {};
  try {
    const seg = token.split(".")[1];
    payload = JSON.parse(Buffer.from(seg, "base64url").toString());
  } catch {
    payload = { decodeError: "Could not decode JWT payload" };
  }

  const expDate = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
  const isExpired = payload.exp ? Date.now() > payload.exp * 1000 : null;
  const issUrl = payload.iss || "";
  const projectRef = issUrl.includes("supabase") ? issUrl.split("//")[1]?.split(".")[0] : null;

  // Also try server-side getUser to see if Supabase accepts the token
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.auth.getUser(token);

  res.json({
    iss: payload.iss,
    exp: expDate,
    isExpired,
    role: payload.role,
    projectRef,
    getUserError: error?.message || null,
  });
});

app.use("/api/transactions", requireAuth, transactions);
app.use("/api/budget", requireAuth, budget);
app.use("/api/analytics", requireAuth, analytics);
app.use("/api/export", requireAuth, exportRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

export default app;
