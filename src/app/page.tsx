import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        OrderFlow Pizza
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        비회원으로 바로 주문할 수 있는 피자 주문 플랫폼입니다.
      </p>
      <div className="flex gap-4">
        <Link
          href="/stores"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          매장찾기
        </Link>
        <Link
          href="/admin/login"
          className="rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium dark:border-white/[.145]"
        >
          관리자 로그인
        </Link>
      </div>
    </div>
  );
}
