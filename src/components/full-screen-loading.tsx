import type { ReactNode } from "react";
import { Spinner } from "@/components/spinner";

export function FullScreenLoading({
  message,
  action,
}: {
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
      <Spinner className="h-8 w-8 text-primary" />
      {message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      )}
      {action}
    </div>
  );
}
