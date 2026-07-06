import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getAllStoresWithOwner } from "@/lib/stores/queries";
import { StoreStatusButtons } from "@/components/store-status-buttons";

export default async function AdminStoresPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin") redirect("/admin/orders");

  const stores = await getAllStoresWithOwner();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">매장 관리</h1>

      <ul className="flex flex-col gap-4">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  판매자: {store.owner.email}
                </p>
              </div>
              <Link
                href={`/admin/stores/${store.id}/orders`}
                className="shrink-0 rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium dark:border-white/[.145]"
              >
                주문 보기
              </Link>
            </div>
            <StoreStatusButtons storeId={store.id} currentStatus={store.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
