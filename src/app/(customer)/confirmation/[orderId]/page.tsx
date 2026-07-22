import Link from "next/link";
import { getOrder, getOrderStatusHistory } from "@/lib/orders/queries";
import { CartSummary } from "@/components/cart-summary";
import { OrderStatusTimeline } from "@/components/order-status-timeline";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  const statusHistory = order ? await getOrderStatusHistory(orderId) : [];

  if (!order) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          주문을 찾을 수 없습니다
        </h1>
        <Link
          href="/menu"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          메뉴로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {/* Neutral heading — this page is now also reached from /orders
            days later, not just right after checkout, so "접수되었습니다"
            would be misleading. The timeline below already shows "접수됨"
            checked off as the first step. */}
        <h1 className="text-2xl font-semibold tracking-tight">주문 상세</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          주문번호: {order.id}
        </p>
      </div>
      <OrderStatusTimeline
        orderId={order.id}
        initialStatus={order.status}
        initialHistory={statusHistory}
      />
      <div>
        <h2 className="mb-2 font-medium">배송 정보</h2>
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
      <div className="flex gap-2">
        <Link
          href={`/menu?storeId=${order.storeId}`}
          className="self-start rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium dark:border-white/[.145]"
        >
          메뉴로 돌아가기
        </Link>
        <Link
          href="/orders"
          className="self-start rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium dark:border-white/[.145]"
        >
          주문 내역 보기
        </Link>
      </div>
    </div>
  );
}
