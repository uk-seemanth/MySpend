import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";
import ThemeToggle from "@/components/common/ThemeToggle";
import FloatingAddButton from "@/components/transactions/FloatingAddButton";
import { useTransactionStore } from "@/store/useTransactionStore";

export default function AppShell() {
  const location = useLocation();
  const fetchCategories = useTransactionStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Sidebar />

      {/* mobile top bar */}
      <header className="flex items-center justify-between px-4 pt-4 lg:hidden">
        <span className="text-lg font-extrabold tracking-tight">My Spend</span>
        <div className="flex items-center">
          <ThemeToggle />
          <Link to="/settings" aria-label="Settings" className="rounded-xl p-2.5 text-ink/70 hover:bg-ink/10">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-36 pt-5 lg:ml-64 lg:px-8 lg:pb-12 lg:pt-8">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      <FloatingAddButton />
      <BottomNav />
    </div>
  );
}
