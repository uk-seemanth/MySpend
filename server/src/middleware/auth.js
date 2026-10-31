import { createClient } from "@supabase/supabase-js";

// Verifies the Supabase JWT by calling GoTrue directly, then sets req.user and req.db
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("AUTH FAIL: NO_TOKEN Missing or malformed authorization header");
    return res.status(401).json({ error: "Missing token", code: "NO_TOKEN" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    console.log("AUTH FAIL: NO_TOKEN Token is empty");
    return res.status(401).json({ error: "Missing token", code: "NO_TOKEN" });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // 1. Decode JWT payload without verification to check iss & exp
  let payload = {};
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    }
  } catch (err) {
    // If JWT cannot be parsed, GoTrue will reject it below
  }

  // Check project (iss claim vs SUPABASE_URL + "/auth/v1")
  const expectedIss = `${supabaseUrl}/auth/v1`;
  if (payload.iss && payload.iss !== expectedIss) {
    console.log(`AUTH FAIL: WRONG_PROJECT Token issuer (${payload.iss}) does not match expected (${expectedIss})`);
    return res.status(401).json({ error: "Token is from a different project", code: "WRONG_PROJECT" });
  }

  // Check token expiration from payload
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    console.log("AUTH FAIL: TOKEN_EXPIRED Token has expired");
    return res.status(401).json({ error: "Token has expired", code: "TOKEN_EXPIRED" });
  }

  // 2. Call GoTrue directly
  let response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log(`AUTH FAIL: SUPABASE_UNREACHABLE ${err.message}`);
    return res.status(502).json({ error: "Supabase unreachable", code: "SUPABASE_UNREACHABLE" });
  }

  if (!response.ok) {
    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    const detail =
      body.msg || body.message || body.error_description || body.error || `HTTP ${response.status}`;
    const detailLower = detail.toLowerCase();

    // Check if Supabase says the apikey is invalid
    if (
      detailLower.includes("api key") ||
      detailLower.includes("apikey") ||
      detailLower.includes("invalid key") ||
      (body.code === 401 && detailLower.includes("key"))
    ) {
      console.log("AUTH FAIL: SERVER_KEY_INVALID Server SUPABASE_ANON_KEY is wrong or cut off");
      return res.status(500).json({
        error: "Server SUPABASE_ANON_KEY is wrong or cut off",
        code: "SERVER_KEY_INVALID",
      });
    }

    // Check if token expired according to GoTrue
    if (detailLower.includes("expired")) {
      console.log(`AUTH FAIL: TOKEN_EXPIRED ${detail}`);
      return res.status(401).json({ error: detail, code: "TOKEN_EXPIRED" });
    }

    // Otherwise token rejected
    console.log(`AUTH FAIL: TOKEN_REJECTED ${detail}`);
    return res.status(401).json({ error: detail, code: "TOKEN_REJECTED" });
  }

  let user;
  try {
    user = await response.json();
  } catch (err) {
    console.log(`AUTH FAIL: TOKEN_REJECTED Failed to parse user response: ${err.message}`);
    return res.status(401).json({ error: "Invalid user response", code: "TOKEN_REJECTED" });
  }

  if (!user || !user.id) {
    console.log("AUTH FAIL: TOKEN_REJECTED User object missing from Supabase response");
    return res.status(401).json({ error: "User not found", code: "TOKEN_REJECTED" });
  }

  req.user = user;
  req.db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  next();
}
