import { create } from "zustand";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { cleanParams } from "@/lib/utils";

export const EMPTY_FILTERS = {
  type: "", category_id: "", from: "", to: "", min: "", max: "", q: "", page: 1, limit: 20,
};

let latestRequest = 0; // ignore stale responses when filters change fast

export const useTransactionStore = create((set, get) => ({
  items: [],
  total: 0,
  categories: [],
  filters: EMPTY_FILTERS,
  loading: true,
  error: null,
  revision: 0, // bumps after any change → budget/analytics hooks refetch

  fetchCategories: async () => {
    if (get().categories.length) return;
    const { data, error } = await supabase.from("categories").select("*");
    if (error) return toast.error("Couldn't load categories");
    // alphabetical, "Other" last
    const sorted = [...data].sort((a, b) =>
      a.name === "Other" ? 1 : b.name === "Other" ? -1 : a.name.localeCompare(b.name)
    );
    set({ categories: sorted });
  },

  fetch: async () => {
    const id = ++latestRequest;
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/transactions", { params: cleanParams(get().filters) });
      if (id !== latestRequest) return;
      set({ items: data.data, total: data.total, loading: false });
    } catch (e) {
      if (id !== latestRequest) return;
      set({ error: e.message, loading: false });
      toast.error(e.message);
    }
  },

  // patch merges into current filters (page resets to 1). replace=true starts fresh.
  setFilters: async (patch, { replace = false } = {}) => {
    const filters = replace
      ? { ...EMPTY_FILTERS, ...patch }
      : { ...get().filters, page: 1, ...patch };
    set({ filters });
    await get().fetch();
  },

  add: async (values) => {
    try {
      await api.post("/transactions", values);
      toast.success("Transaction added");
      set((s) => ({ revision: s.revision + 1 }));
      await get().fetch();
    } catch (e) {
      toast.error(e.message);
      throw e; // lets form stay open
    }
  },

  update: async (id, values) => {
    try {
      await api.put(`/transactions/${id}`, values);
      toast.success("Transaction updated");
      set((s) => ({ revision: s.revision + 1 }));
      await get().fetch();
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  },

  remove: async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      set((s) => ({ revision: s.revision + 1 }));
      await get().fetch();
    } catch (e) {
      toast.error(e.message);
    }
  },

  // current filters applied; overrides lets Reports page force a month range
  downloadCsv: async (overrides = {}) => {
    const { page, limit, ...filters } = { ...get().filters, ...overrides };
    try {
      const res = await api.get("/export/csv", {
        params: cleanParams(filters),
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: "my-spend-export.csv",
      });
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (e) {
      toast.error(e.message);
    }
  },
}));
