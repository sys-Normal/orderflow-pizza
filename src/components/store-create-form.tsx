"use client";

import { useActionState } from "react";
import { createStoreAction } from "@/lib/stores/actions";
import { StoreLocationPicker } from "@/components/store-location-picker";
import { PROJECT_NAME } from "@/lib/constants";

export function StoreCreateForm() {
  const [state, action, pending] = useActionState(createStoreAction, undefined);

  if (state && "success" in state) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]">
        <p className="text-sm font-medium">
          &quot;{state.storeName}&quot; 지점이 생성되었습니다.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          아래 계정 정보를 지점주에게 전달해주세요. 비밀번호는 다시 확인할 수 없습니다.
        </p>
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-zinc-600 dark:text-zinc-400">이메일</dt>
            <dd className="font-mono">{state.loginEmail}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-zinc-600 dark:text-zinc-400">임시 비밀번호</dt>
            <dd className="font-mono">{state.tempPassword}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          지점명
        </label>
        <div className="flex items-center gap-2 rounded border border-black/[.08] px-3 dark:border-white/[.145]">
          <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
            {PROJECT_NAME}
          </span>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="강남점"
            className="w-full bg-transparent py-2 outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium">
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="02-0000-0000"
          className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="loginEmail" className="text-sm font-medium">
          지점주 로그인 이메일
        </label>
        <input
          id="loginEmail"
          name="loginEmail"
          type="email"
          required
          className="rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
        />
      </div>
      <StoreLocationPicker />

      {state && "error" in state && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "생성 중..." : "지점 생성"}
      </button>
    </form>
  );
}
