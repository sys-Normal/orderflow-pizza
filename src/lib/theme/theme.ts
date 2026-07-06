export type ThemePreference = "system" | "light" | "dark";

// Keep this in sync with the inline bootstrap script in src/app/layout.tsx.
export const THEME_STORAGE_KEY = "theme";

const THEME_CHANGE_EVENT = "themepreferencechange";

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function getServerThemePreference(): ThemePreference {
  return "system";
}

export function getIsDarkEffective(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function getServerIsDarkEffective(): boolean {
  return false;
}

export function applyThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === "system") {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    root.classList.toggle(
      "dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  } else {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    root.classList.toggle("dark", preference === "dark");
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeThemePreference(onChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
