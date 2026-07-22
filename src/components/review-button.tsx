// Placeholder until a review feature exists — same "disabled, not wired up
// yet" pattern as the "설정" entry in user-menu.tsx.
export function ReviewButton() {
  return (
    <button
      type="button"
      disabled
      className="rounded-full border border-black/[.08] px-3 py-1.5 text-xs font-medium text-zinc-400 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-500"
    >
      리뷰쓰기
    </button>
  );
}
