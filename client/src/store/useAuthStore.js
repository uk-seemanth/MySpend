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

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // only set state here; no awaited supabase calls inside this callback
      if (event === "SIGNED_IN") {
        set({ user: session?.user ?? null });
        if (!get().profile && session?.user) {
          get().fetchProfile(); // un-awaited async call
        }
      } else if (event === "TOKEN_REFRESHED") {
        // update user but keep existing profile intact
        set({ user: session?.user ?? null });
      } else if (event === "SIGNED_OUT") {
        set({ user: null, profile: null });
      } else {
        set({ user: session?.user ?? null });
        if (!session) set({ profile: null });
      }
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
    if (error) {
      if (error.message?.includes("Email not confirmed")) {
        const err = new Error(
          "Please confirm your email first. Check your inbox and spam folder."
        );
        err.code = "EMAIL_NOT_CONFIRMED";
        throw err;
      }
      throw error;
    }
    await get().fetchProfile();
  },

  resendConfirmation: async (email) => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
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
