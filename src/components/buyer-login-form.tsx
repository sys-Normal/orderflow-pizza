"use client";

import { useActionState } from "react";
import Link from "next/link";
import { buyerLoginAction } from "@/lib/auth/buyer-actions";

export function BuyerLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(buyerLoginAction, undefined);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
        또는
        <span className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
      </div>

      <a
        href={`/api/auth/google?next=${encodeURIComponent(next)}`}
        className="flex items-center justify-center rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.1] dark:border-white/[.145] dark:hover:bg-white/[.15]"
      >
        Google로 로그인
      </a>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        아직 계정이 없으신가요?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-medium text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}
