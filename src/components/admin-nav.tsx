"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pizza } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { SessionRole } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminNav({ role }: { role?: SessionRole }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Pizza className="h-6 w-6 text-primary" />
          OrderFlow Pizza · Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {role === "platform_admin" ? (
            <>
              <Link href="/admin/stores">매장 관리</Link>
              <Link href="/admin/orders/search">주문 검색</Link>
            </>
          ) : (
            <Link href="/admin/orders">주문 목록</Link>
          )}
          <ThemeToggle />
          <form action={logoutAction}>
            <button type="submit">로그아웃</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
