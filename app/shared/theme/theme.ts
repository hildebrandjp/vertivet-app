export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "vertivet-theme";
export const DEFAULT_THEME: Theme = "light";

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

/** Reads the theme currently applied to <html>. Client-only. */
export function getTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : DEFAULT_THEME;
}

/**
 * Applies a theme to <html> (or to `target` for a scoped theme) and,
 * when `persist` is true, remembers it in localStorage. Client-only.
 */
export function setTheme(
  theme: Theme,
  { target, persist = true }: { target?: HTMLElement; persist?: boolean } = {},
): void {
  (target ?? document.documentElement).dataset.theme = theme;
  if (!persist) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies): ignore.
  }
}

/** Returns the stored theme preference, if any. Client-only. */
export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}
