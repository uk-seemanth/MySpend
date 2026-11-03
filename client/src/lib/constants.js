import {
  Utensils, Plane, Receipt, ShoppingBag, HeartPulse, PartyPopper, CircleEllipsis, Dumbbell,
} from "lucide-react";

const CATEGORY_ICONS = {
  utensils: Utensils,
  plane: Plane,
  receipt: Receipt,
  "shopping-bag": ShoppingBag,
  "heart-pulse": HeartPulse,
  "party-popper": PartyPopper,
  "circle-ellipsis": CircleEllipsis,
  dumbbell: Dumbbell,
};
export const getCategoryIcon = (name) => CATEGORY_ICONS[name] ?? CircleEllipsis;

/** Fallback color when category has none */
export const getCategoryColor = (category) => category?.color ?? "#8A8A7A";

// Green → red scale. Full class strings so Tailwind can see them.
export const HEALTH = {
  safe:    { label: "On track",  hex: "#5FA96B", bar: "bg-health-safe",    text: "text-health-safe",    soft: "bg-health-safe/15" },
  caution: { label: "Watch it",  hex: "#A8AD3A", bar: "bg-health-caution", text: "text-health-caution", soft: "bg-health-caution/15" },
  warning: { label: "Careful",   hex: "#E08A2E", bar: "bg-health-warning", text: "text-health-warning", soft: "bg-health-warning/15" },
  danger:  { label: "Over limit", hex: "#D64545", bar: "bg-health-danger",  text: "text-health-danger",  soft: "bg-health-danger/15" },
};

// 0-50 green, 50-75 olive-yellow, 75-100 orange, 100+ red
export const getHealthKey = (percent = 0) =>
  percent >= 100 ? "danger" : percent >= 75 ? "warning" : percent >= 50 ? "caution" : "safe";

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "SGD", "AED"];
