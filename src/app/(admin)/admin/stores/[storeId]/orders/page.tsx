import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getOrdersForStore } from "@/lib/orders/queries";
import { getStoreById } from "@/lib/stores/queries";
import { OrderList } from "@/components/order-list";

export default async function AdminStoreOrdersPage({
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

  const orders = await getOrdersForStore(storeId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/stores"
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← 매장 목록
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {store.name} 주문 목록
        </h1>
      </div>
      <OrderList orders={orders} />
    </div>
  );
}
