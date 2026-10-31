import axios from "axios";
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
    if (error.response?.status === 401) await supabase.auth.signOut();
    // surface server message so toasts show something useful
    error.message = error.response?.data?.error || error.message;
    return Promise.reject(error);
  }
);
