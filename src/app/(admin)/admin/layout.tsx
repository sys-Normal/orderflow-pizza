import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin-nav";
import { getSessionUser } from "@/lib/auth/current-user";
import { getStoreByOwnerId } from "@/lib/stores/queries";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  const store =
    session?.role === "seller" ? await getStoreByOwnerId(session.userId) : null;

  return (
    <>
      <AdminNav role={session?.role} hasApprovedStore={store?.status === "approved"} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {children}
      </main>
    </>
  );
}
