"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/admin/orders" className="text-lg font-semibold tracking-tight">
          OrderFlow Pizza · Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/admin/orders">주문 목록</Link>
          <form action={logoutAction}>
            <button type="submit">로그아웃</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
