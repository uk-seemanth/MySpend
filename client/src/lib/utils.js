import { format, parseISO } from "date-fns";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const formatMoney = (amount = 0, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDate = (iso) => format(parseISO(iso), "d MMM yyyy");
export const toISODate = (date = new Date()) => format(date, "yyyy-MM-dd");

// drop empty filter values before sending to API
export const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));
