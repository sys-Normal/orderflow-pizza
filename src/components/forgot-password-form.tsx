"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/auth/reset-actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);

  if (state?.message) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p className="text-sm">{state.message}</p>
        <Link href="/admin/login" className="text-sm font-medium text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
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
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "전송 중..." : "재설정 메일 보내기"}
      </button>
      <Link href="/admin/login" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        로그인으로 돌아가기
      </Link>
    </form>
  );
}
