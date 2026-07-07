export function ConfirmDialog({
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/[.08] bg-surface p-5 dark:border-white/[.145]">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium dark:border-white/[.145]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
