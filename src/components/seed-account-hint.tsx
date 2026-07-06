"use client";

import { useToast } from "@/lib/toast/toast-context";

const SEED_ACCOUNTS = [
  { label: "판매자", email: "seller@orderflow.pizza", password: "seller1234!" },
  { label: "플랫폼 관리자", email: "admin@orderflow.pizza", password: "admin1234!" },
];

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Clipboard API can be unavailable/denied (older browsers, some
    // automated/sandboxed contexts) — fall back to the legacy technique.
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const succeeded = document.execCommand("copy");
      document.body.removeChild(textarea);
      return succeeded;
    } catch {
      return false;
    }
  }
}

function CopyableCode({
  value,
  onCopied,
  onFailed,
}: {
  value: string;
  onCopied: () => void;
  onFailed: () => void;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        const succeeded = await copyToClipboard(value);
        if (succeeded) {
          onCopied();
        } else {
          onFailed();
        }
      }}
      className="rounded bg-black/[.05] px-1.5 py-0.5 font-mono text-xs transition-colors hover:bg-black/[.1] dark:bg-white/[.1] dark:hover:bg-white/[.15]"
    >
      {value}
    </button>
  );
}

export function SeedAccountHint() {
  const { showToast } = useToast();
  const handleFailed = () => showToast("복사에 실패했습니다. 직접 선택해 복사해주세요.");

  return (
    <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
      <p>포트폴리오용 시드 계정 (클릭하면 복사됩니다)</p>
      {SEED_ACCOUNTS.map((account) => (
        <p key={account.email} className="flex flex-wrap items-center gap-1.5">
          <span>{account.label}:</span>
          <CopyableCode
            value={account.email}
            onCopied={() => showToast(`이메일 복사됨: ${account.email}`)}
            onFailed={handleFailed}
          />
          <span>/</span>
          <CopyableCode
            value={account.password}
            onCopied={() => showToast("비밀번호 복사됨")}
            onFailed={handleFailed}
          />
        </p>
      ))}
    </div>
  );
}
