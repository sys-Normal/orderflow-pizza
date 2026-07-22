import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getStoreById } from "@/lib/stores/queries";
import { reverseGeocode } from "@/lib/stores/reverse-geocode";
import { StoreStatusBadge } from "@/components/store-status-badge";
import { StoreStatusDropdown } from "@/components/store-status-dropdown";
import { StoreLocation } from "@/components/store-location";
import { PhoneContact } from "@/components/phone-contact";
import { StoreOrdersButton } from "@/components/store-orders-modal";

export default async function AdminStoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin") redirect("/admin/orders");

  const { storeId } = await params;
  const store = await getStoreById(storeId);

  if (!store) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          매장을 찾을 수 없습니다
        </h1>
        <Link
          href="/admin/stores"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          매장 목록으로
        </Link>
      </div>
    );
  }

  const address = await reverseGeocode(store.latitude, store.longitude);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/stores"
        className="inline-flex items-center gap-1 self-start text-sm text-zinc-600 hover:text-primary dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        매장 목록
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{store.name}</h1>
          <StoreStatusBadge status={store.status} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StoreOrdersButton storeId={store.id} storeName={store.name} />
          <StoreStatusDropdown storeId={store.id} currentStatus={store.status} />
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          담당자 정보
        </h2>
        <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]">
          <p className="flex flex-wrap items-center gap-1.5 text-sm">
            전화: <PhoneContact phone={store.phone} />
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            이메일: {store.contactEmail}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          위치
        </h2>
        <div className="rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]">
          <StoreLocation
            address={address ?? `${store.latitude}, ${store.longitude}`}
            latitude={store.latitude}
            longitude={store.longitude}
            name={store.name}
          />
        </div>
      </section>
    </div>
  );
}
