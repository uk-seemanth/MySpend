import axios from "axios";
import { toast } from "sonner";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:4000/api
});

// Attach fresh token to every request (supabase refreshes it if expired)
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session) config.headers.Authorization = `Bearer ${data.session.access_token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const body = error.response?.data;
    const code = body?.code;
    const message = body?.error || error.message;

    // Always log the failing URL, status, and response body
    console.error("[api interceptor]", originalRequest.url, "status:", status, "body:", body);

    // Network error (no response from server)
    if (!error.response) {
      toast.error("Network error: Could not reach server");
      return Promise.reject(error);
    }

    // For SERVER_KEY_INVALID, WRONG_PROJECT, SUPABASE_UNREACHABLE: do not sign out, show toast
    if (
      code === "SERVER_KEY_INVALID" ||
      code === "WRONG_PROJECT" ||
      code === "SUPABASE_UNREACHABLE"
    ) {
      toast.error(message);
      error.message = message;
      return Promise.reject(error);
    }

    // Handle 401
    if (status === 401) {
      // First 401 attempt: refresh session and retry once
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError && refreshData?.session) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshData.session.access_token}`;
          return api(originalRequest);
        }

        // Refresh failed -> sign out
        await supabase.auth.signOut();
        toast.error("Session expired. Please log in again.");
        error.message = message;
        return Promise.reject(error);
      }

      // Retry also returned 401: sign out only if TOKEN_REJECTED or TOKEN_EXPIRED
      if (code === "TOKEN_REJECTED" || code === "TOKEN_EXPIRED") {
        await supabase.auth.signOut();
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(message);
      }
      error.message = message;
      return Promise.reject(error);
    }

    // Surface server message so callers and toasts show useful info
    error.message = message;
    return Promise.reject(error);
  }
);
