"use client";

import { useEffect, useRef, useState } from "react";
import { buyerLogoutAction } from "@/lib/auth/buyer-actions";

// Temporary nickname until real profile settings exist — derived from the
// email's local part (e.g. "buyer@orderflow.pizza" -> "buyer").
function deriveNickname(email: string): string {
  return email.split("@")[0];
}

export function UserMenu({
  email,
  provider,
}: {
  email: string;
  provider: "email" | "google";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const nickname = deriveNickname(email);
  const providerLabel = provider === "google" ? "Google 계정" : "이메일 계정";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="사용자 메뉴"
        aria-expanded={open}
        title={email}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
      >
        {email.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-48">
          <div className="relative rounded-lg border border-black/[.08] bg-surface p-3 shadow-lg dark:border-white/[.145]">
            <span
              aria-hidden="true"
              className="absolute -top-1.5 right-2 h-3 w-3 rotate-45 border-l border-t border-black/[.08] bg-surface dark:border-white/[.145]"
            />
            <div className="flex flex-col gap-0.5 pb-3">
              <p className="truncate text-sm font-semibold">{nickname}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {providerLabel}
              </p>
            </div>
            <div className="flex flex-col gap-1 border-t border-black/[.08] pt-2 dark:border-white/[.145]">
              <button
                type="button"
                disabled
                className="rounded px-2 py-1.5 text-left text-sm text-zinc-400 disabled:opacity-50 dark:text-zinc-500"
              >
                설정
              </button>
              <form action={buyerLogoutAction}>
                <button
                  type="submit"
                  className="w-full rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/[.05] dark:hover:bg-white/[.08]"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
