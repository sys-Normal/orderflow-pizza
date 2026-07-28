"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth/reset-actions";
import { PasswordInput } from "@/components/password-input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  // Controlled so a failed submission (e.g. mismatch) doesn't wipe what was
  // typed — React resets uncontrolled fields once the <form action> resolves,
  // even when the action itself returns an error.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (state && "success" in state) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p className="text-sm">비밀번호가 변경되었습니다.</p>
        <Link href="/admin/login" className="text-sm font-medium text-primary hover:underline">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          새 비밀번호
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          새 비밀번호 확인
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>
      {state && "error" in state && (
        <p key={state.nonce} className="shake-y text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
