import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { getOrder } from "@/lib/orders/queries";
import { CartSummary } from "@/components/cart-summary";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

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
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CircleCheck className="h-6 w-6 text-green-600 dark:text-green-500" />
          주문이 접수되었습니다
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          주문번호: {order.id}
        </p>
      </div>
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
      <Link
        href={`/menu?storeId=${order.storeId}`}
        className="self-start rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium dark:border-white/[.145]"
      >
        메뉴로 돌아가기
      </Link>
    </div>
  );
}
