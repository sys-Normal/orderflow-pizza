"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  applyThemePreference,
  getIsDarkEffective,
  getServerIsDarkEffective,
  getStoredThemePreference,
  subscribeThemePreference,
} from "@/lib/theme/theme";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 3v3M12 18v3M4.5 4.5l2.1 2.1M17.4 17.4l2.1 2.1M3 12h3M18 12h3M4.5 19.5l2.1-2.1M17.4 6.6l2.1-2.1" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20 12.8A8.5 8.5 0 1 1 11.2 4a6.6 6.6 0 0 0 8.8 8.8z" />
    </svg>
  );
}

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
      className="relative flex h-8 w-14 shrink-0 items-center rounded-full border border-black/[.08] bg-black/[.04] px-1 dark:border-white/[.145] dark:bg-white/[.08]"
    >
      <span
        aria-hidden
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform duration-200 ease-out ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <MoonIcon className="h-3.5 w-3.5" />
        ) : (
          <SunIcon className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
