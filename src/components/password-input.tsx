"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  id,
  name,
  required,
  minLength,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  // Optional controlled mode — pass both to keep the typed value across a
  // failed form submission (React resets uncontrolled fields once the
  // action tied to the enclosing <form action> resolves, even on error).
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded border border-black/[.08] bg-transparent px-3 dark:border-white/[.145]">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full bg-transparent py-2 outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
        className="shrink-0 text-zinc-500 hover:text-foreground dark:text-zinc-400"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
