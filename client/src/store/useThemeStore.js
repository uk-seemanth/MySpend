import { create } from "zustand";

const KEY = "myspend-theme"; // "light" | "dark" | "system"
const media = window.matchMedia("(prefers-color-scheme: dark)");

function apply(theme) {
  const dark = theme === "dark" || (theme === "system" && media.matches);
  document.documentElement.classList.toggle("dark", dark);
}

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem(KEY) || "system",

  setTheme: (theme) => {
    localStorage.setItem(KEY, theme);
    apply(theme);
    set({ theme });
  },

  // call once at startup; follows OS changes while on "system"
  init: () => {
    apply(get().theme);
    const onChange = () => get().theme === "system" && apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  },
}));
