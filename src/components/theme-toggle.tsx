"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  applyThemePreference,
  getIsDarkEffective,
  getServerIsDarkEffective,
  getStoredThemePreference,
  subscribeThemePreference,
} from "@/lib/theme/theme";

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeThemePreference,
    getIsDarkEffective,
    getServerIsDarkEffective
  );

  // Only relevant before the switch is ever touched: keep following the OS
  // setting live while no explicit light/dark override has been chosen.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (getStoredThemePreference() === "system") {
        applyThemePreference("system");
      }
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark ? "다크 모드 (클릭 시 라이트 모드로 전환)" : "라이트 모드 (클릭 시 다크 모드로 전환)"
      }
      onClick={() => applyThemePreference(isDark ? "light" : "dark")}
      className="relative flex h-7 w-12 shrink-0 items-center rounded-full border border-black/[.08] bg-black/[.04] px-1 transition-colors hover:border-primary dark:border-white/[.145] dark:bg-white/[.08] dark:hover:border-primary"
    >
      <span
        aria-hidden
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform duration-200 ease-out ${
          isDark ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      </span>
    </button>
  );
}
