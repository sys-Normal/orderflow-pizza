"use client";

import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/lib/toast/toast-context";

export function PhoneContact({ phone }: { phone: string }) {
  const { showToast } = useToast();

  async function handleCopy() {
    const succeeded = await copyToClipboard(phone);
    showToast(succeeded ? "전화번호가 복사되었습니다." : "복사에 실패했습니다.");
  }

  return (
    <span className="inline-flex items-center gap-1">
      <a
        href={`tel:${phone}`}
        className="font-bold text-foreground underline underline-offset-2"
      >
        {phone}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="전화번호 복사"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-black/[.08] hover:text-foreground dark:hover:bg-white/[.1]"
      >
        <Copy className="h-3 w-3" />
      </button>
    </span>
  );
}
