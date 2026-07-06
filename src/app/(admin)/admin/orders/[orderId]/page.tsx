import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getOrderForSession } from "@/lib/orders/queries";
import { CartSummary } from "@/components/cart-summary";
import { OrderStatusButtons } from "@/components/order-status-buttons";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  const order = await getOrderForSession(orderId, session);

  if (!order) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          주문을 찾을 수 없습니다
        </h1>
        <Link
          href="/admin/orders"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          주문 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">주문 상세</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          주문번호: {order.id}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">고객 정보</h2>
        <p className="text-sm">{order.customer.name}</p>
        <p className="text-sm">{order.customer.phone}</p>
        <p className="text-sm">{order.customer.address}</p>
        {order.customer.notes && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            요청사항: {order.customer.notes}
          </p>
        )}
      </div>

      <CartSummary items={order.items} subtotal={order.subtotal} />

      <div>
        <h2 className="mb-2 font-medium">상태</h2>
        <OrderStatusButtons orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  );
}
