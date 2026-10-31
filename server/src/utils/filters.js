// One place for filter logic. Used by list route AND CSV export.
export function applyFilters(query, f) {
  if (f.type) query = query.eq("type", f.type);
  if (f.category_id) query = query.eq("category_id", f.category_id);
  if (f.from) query = query.gte("date", f.from);
  if (f.to) query = query.lte("date", f.to);
  if (f.min !== undefined) query = query.gte("amount", f.min);
  if (f.max !== undefined) query = query.lte("amount", f.max);
  if (f.q) {
    const safe = f.q.replace(/[,()%*]/g, " "); // keep PostgREST filter syntax intact
    query = query.or(`title.ilike.%${safe}%,note.ilike.%${safe}%`);
  }
  return query;
}
