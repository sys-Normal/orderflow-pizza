import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { searchOrders } from "@/lib/orders/queries";
import { OrderList } from "@/components/order-list";

export default async function AdminOrderSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin") redirect("/admin/orders");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const orders = query ? await searchOrders(query) : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">주문 검색</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        매장 구분 없이 주문번호·고객명·전화번호로 특정 주문을 찾을 때 사용하세요.
      </p>
      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="주문번호, 고객명, 전화번호"
          className="flex-1 rounded border border-black/[.08] bg-transparent px-3 py-2 dark:border-white/[.145]"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          검색
        </button>
      </form>
      {query ? (
        <OrderList orders={orders} emptyMessage="검색 결과가 없습니다." />
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">검색어를 입력해주세요.</p>
      )}
    </div>
  );
}
