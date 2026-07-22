import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getOrdersForSession } from "@/lib/orders/queries";
import { LiveOrderFeed } from "@/components/live-order-feed";

export default async function AdminOrdersPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  // Platform admins don't get a flat cross-store feed anymore — they browse
  // orders per store from the store list, or use /admin/orders/search.
  if (session.role === "platform_admin") redirect("/admin/stores");

  const orders = await getOrdersForSession(session);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">주문 목록</h1>
      <LiveOrderFeed initialOrders={orders} />
    </div>
  );
}
