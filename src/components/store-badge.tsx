import { Store } from "lucide-react";

// Shared with the /menu header (same badge shape) so "which store am I
// looking at" reads consistently across /menu, /cart, and /checkout.
export function StoreBadge({
  storeName,
  subtitle,
}: {
  storeName: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Store className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold tracking-tight">
          {storeName}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      </div>
    </div>
  );
}
