import Link from "next/link";
import { Pizza } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <Pizza className="h-8 w-8 text-primary" />
        OrderFlow Pizza
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        매장 탐색과 장바구니는 자유롭게, 주문할 때만 로그인하면 되는 피자 주문 플랫폼입니다.
      </p>
      <Link
        href="/stores"
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        매장찾기
      </Link>
      <Link
        href="/admin/login"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        판매자·관리자 로그인
      </Link>
    </div>
  );
}
