/**
 * One definition of what an input looks like, shared by the storefront forms
 * and the admin panel so the two never drift apart.
 *
 * The 0.75rem vertical padding puts every control at a ~46px tap target, which
 * is the smallest comfortable size on a phone; labels sit 0.5rem above.
 */
export const FIELD_LABEL = "block text-sm font-semibold text-ink-800";

export const FIELD_INPUT =
  "mt-2 w-full rounded-xl border border-ink-200 bg-cream px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export const FIELD_HINT = "mt-1.5 text-xs text-ink-500";
