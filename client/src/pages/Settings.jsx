import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const THEMES = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];

export default function Settings() {
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.display_name ?? "");
  const [currency, setCurrency] = useState(profile?.currency ?? "USD");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ display_name: name.trim() || null, currency });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <Card>
        <h2 className="mb-4 font-bold">Profile</h2>
        <form onSubmit={save} className="space-y-4">
          <Input label="Email" value={user?.email ?? ""} disabled readOnly />
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Currency" as="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </Input>
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Appearance</h2>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-xl bg-ink/10 p-1">
          {THEMES.map((t) => (
            <button
              key={t.key}
              role="radio"
              aria-checked={theme === t.key}
              onClick={() => setTheme(t.key)}
              className={cn(
                "rounded-lg py-2 text-sm font-semibold transition",
                theme === t.key ? "bg-card shadow-soft" : "text-ink/60"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Button variant="danger" onClick={logout}>
        <LogOut className="h-4 w-4" /> Log out
      </Button>
    </div>
  );
}
