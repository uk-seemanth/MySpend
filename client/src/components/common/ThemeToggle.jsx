import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

const ORDER = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const Icon = ICONS[theme];
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${theme}. Switch to ${next}`}
      title={`Theme: ${theme}`}
      className="rounded-xl p-2.5 text-ink/70 transition hover:bg-ink/10"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
