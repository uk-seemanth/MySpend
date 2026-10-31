import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <div className="rounded-2xl bg-olive/15 p-4 text-olive">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      {text && <p className="max-w-xs text-sm text-ink/60">{text}</p>}
      {action}
    </div>
  );
}
