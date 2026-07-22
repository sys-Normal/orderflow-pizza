import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getAllStoresWithOwner } from "@/lib/stores/queries";
import { reverseGeocode } from "@/lib/stores/reverse-geocode";
import { StoreStatusBadge } from "@/components/store-status-badge";
import { StoreStatusDropdown } from "@/components/store-status-dropdown";
import { StoreLocation } from "@/components/store-location";
import { PhoneContact } from "@/components/phone-contact";
import { StoreOrdersButton } from "@/components/store-orders-modal";

export default async function AdminStoresPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin") redirect("/admin/orders");

  const stores = await getAllStoresWithOwner();
  const addresses = await Promise.all(
    stores.map((store) => reverseGeocode(store.latitude, store.longitude))
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">매장 관리</h1>

      <ul className="flex flex-col gap-4">
        {stores.map((store, index) => (
          <li
            key={store.id}
            className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  {store.name}
                  <StoreStatusBadge status={store.status} />
                </p>
                <p className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  담당자: <PhoneContact phone={store.phone} />
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StoreOrdersButton storeId={store.id} storeName={store.name} />
                <Link
                  href={`/admin/stores/${store.id}`}
                  className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium dark:border-white/[.145]"
                >
                  자세히 보기
                </Link>
                <StoreStatusDropdown storeId={store.id} currentStatus={store.status} />
              </div>
            </div>
            <StoreLocation
              address={addresses[index] ?? `${store.latitude}, ${store.longitude}`}
              latitude={store.latitude}
              longitude={store.longitude}
              name={store.name}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
