import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin-nav";
import { getSessionUser } from "@/lib/auth/current-user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  return (
    <>
      <AdminNav role={session?.role} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {children}
      </main>
    </>
  );
}
