// Categories themselves (id, icon, which listing types they apply to) are
// defined once on the backend (backend/utils/categories.js) and served via
// GET /categories — that stays the single source of truth for IDs used in
// the DB/search filters. But the *display label* returned by that API is
// always English. This helper maps a category's id to a translated label
// via the same t() system used everywhere else on the site, so switching
// language also translates category names wherever they appear (category
// grid, search filters, listing form, registration form).
//
// Falls back to the raw label from the API if a category is ever added on
// the backend before its translation exists here — so a missing key shows
// English instead of a broken/blank label.
export const categoryLabel = (category, t) => {
  if (!category) return "";
  const key = `categories.${category.id}`;
  const translated = t(key);
  return translated === key ? category.label : translated;
};
