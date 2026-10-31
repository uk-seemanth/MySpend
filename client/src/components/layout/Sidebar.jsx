import { NavLink } from "react-router-dom";
import { Coins } from "lucide-react";
import { NAV } from "./nav";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const profile = useAuthStore((s) => s.profile);
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line/60 bg-card p-5 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-olive text-olive-on">
          <Coins className="h-5 w-5" />
        </span>
        <span className="text-lg font-extrabold tracking-tight">My Spend</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive ? "bg-olive text-olive-on" : "text-ink/70 hover:bg-ink/5"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-line/60 pt-4">
        <span className="truncate px-2 text-sm font-medium text-ink/70">
          {profile?.display_name || "Account"}
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
