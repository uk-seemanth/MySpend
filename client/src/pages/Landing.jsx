import { Link, Navigate } from "react-router-dom";
import { Coins, Wallet, PieChart, BellRing } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import ThemeToggle from "@/components/common/ThemeToggle";
import Button from "@/components/ui/Button";

const FEATURES = [
  { icon: Wallet, title: "Set a budget", text: "Weekly or monthly. The bar shifts from green to red as you spend." },
  { icon: BellRing, title: "Get a nudge", text: "A heads-up at 80% and a warning when you go over." },
  { icon: PieChart, title: "See where it goes", text: "Charts by day, week, month and category, plus CSV export." },
];

export default function Landing() {
  const { user, loading } = useAuthStore();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5">
      <header className="flex items-center justify-between py-5">
        <span className="flex items-center gap-2.5 text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-olive text-olive-on">
            <Coins className="h-5 w-5" />
          </span>
          My Spend
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-12">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Know where your money goes before the month ends.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink/65">
          Log expenses in seconds, set a limit, and watch your budget health at a glance.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register"><Button size="lg">Create free account</Button></Link>
          <Link to="/login"><Button size="lg" variant="secondary">Log in</Button></Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card">
              <Icon className="mb-3 h-6 w-6 text-olive" aria-hidden />
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink/60">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
