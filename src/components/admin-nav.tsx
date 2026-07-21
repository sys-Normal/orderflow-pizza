"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pizza } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { SessionRole } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";

const ROLE_LABEL: Record<string, string> = {
  platform_admin: "플랫폼 관리자",
  seller: "판매자",
};

const ROLE_BADGE_CLASS: Record<string, string> = {
  platform_admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  seller: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};

export function AdminNav({ role }: { role?: SessionRole }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Pizza className="h-6 w-6 text-primary" />
          OrderFlow Pizza
          {role && ROLE_LABEL[role] && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASS[role]}`}
            >
              {ROLE_LABEL[role]}
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {!isLoginPage &&
            (role === "platform_admin" ? (
              <>
                <Link href="/admin/stores">매장 관리</Link>
                <Link href="/admin/orders/search">주문 검색</Link>
              </>
            ) : (
              <Link href="/admin/orders">주문 목록</Link>
            ))}
          <ThemeToggle />
          {!isLoginPage && (
            <form action={logoutAction}>
              <button type="submit">로그아웃</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
