"use client";

import { useState, useTransition } from "react";
import { resetSellerPasswordAction } from "@/lib/stores/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ResetSellerPasswordButton({ storeId }: { storeId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setConfirming(false);
    startTransition(async () => {
      const password = await resetSellerPasswordAction(storeId);
      setTempPassword(password);
    });
  }

  if (tempPassword) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]">
        <p className="text-sm font-medium">새 임시 비밀번호가 발급되었습니다.</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          아래 값을 지점주에게 전달해주세요. 다시 확인할 수 없습니다.
        </p>
        <p className="font-mono text-sm">{tempPassword}</p>
        <button
          type="button"
          onClick={() => setTempPassword(null)}
          className="self-start text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          닫기
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirming(true)}
        className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/[.145]"
      >
        비밀번호 초기화
      </button>
      {confirming && (
        <ConfirmDialog
          title="비밀번호 초기화"
          message="이 지점주의 비밀번호를 초기화하고 새 임시 비밀번호를 발급하시겠습니까? 기존 비밀번호는 즉시 무효화됩니다."
          confirmLabel="초기화"
          cancelLabel="취소"
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
