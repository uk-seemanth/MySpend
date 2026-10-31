import { LayoutDashboard, ArrowLeftRight, PieChart, Wallet, FileText, Settings } from "lucide-react";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];
