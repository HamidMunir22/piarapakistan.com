export const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);

// "16 Aug 2026" -- unambiguous regardless of locale (no DD/MM vs MM/DD
// confusion), used anywhere the admin panel shows a registration/joined date.
export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// The backend returns uploaded file paths as relative URLs (e.g.
// "/uploads/listings/xxx.jpg"). That's fine when the frontend and backend
// share a domain, but PiaraPakistan is usually deployed with the frontend on
// Hostinger and the backend on Railway/VPS — different domains — so relative
// paths would otherwise resolve against the frontend's own origin and 404.
// This prefixes them with VITE_API_URL when it's configured.
export const resolveImageUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const base = import.meta.env.VITE_API_URL || "";
  return `${base}${path}`;
};
