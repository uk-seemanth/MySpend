import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true, // true until first session check done

  // call once in <App/>. Returns unsubscribe fn.
  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ user: data.session?.user ?? null });
    if (data.session) await get().fetchProfile();
    set({ loading: false });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // only set state here; no awaited supabase calls inside this callback
      set({ user: session?.user ?? null });
      if (!session) set({ profile: null });
    });
    return () => sub.subscription.unsubscribe();
  },

  fetchProfile: async () => {
    const { data } = await supabase.from("profiles").select("*").maybeSingle();
    set({ profile: data });
  },

  signUp: async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) throw error;
    return data; // data.session is null when email confirmation is on
  },

  signIn: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await get().fetchProfile();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (patch) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", get().user.id)
      .select()
      .single();
    if (error) throw error;
    set({ profile: data });
  },
}));
