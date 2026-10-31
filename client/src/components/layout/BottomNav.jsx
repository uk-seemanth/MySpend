import { NavLink } from "react-router-dom";
import { NAV } from "./nav";
import { cn } from "@/lib/utils";

// 5 most-used tabs on mobile (Settings reachable from Dashboard header)
const TABS = NAV.filter((n) => n.to !== "/settings");

export default function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold",
              isActive ? "text-olive" : "text-ink/55"
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
