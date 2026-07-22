"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getStoreOrdersPage } from "@/lib/orders/actions";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/orders/types";

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function StoreOrdersButton({
  storeId,
  storeName,
}: {
  storeId: string;
  storeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function loadPage(nextPage: number) {
    startTransition(async () => {
      const result = await getStoreOrdersPage(storeId, nextPage);
      setOrders(result.orders);
      setTotalCount(result.totalCount);
      setPage(result.page);
    });
  }

  function handleOpen() {
    setOpen(true);
    loadPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium dark:border-white/[.145]"
      >
        주문 보기
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-black/[.08] bg-surface dark:border-white/[.145]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[.08] p-4 dark:border-white/[.145]">
              <h2 className="font-semibold">{storeName} 주문 목록</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-black/[.05] dark:hover:bg-white/[.08]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!orders || isPending ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">불러오는 중...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  아직 접수된 주문이 없습니다.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/[.08] text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
                      <th className="py-2 pr-2 font-medium">주문자</th>
                      <th className="py-2 pr-2 font-medium">일시</th>
                      <th className="py-2 pr-2 font-medium">상태</th>
                      <th className="py-2 text-right font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-black/[.05] last:border-0 dark:border-white/[.08]"
                      >
                        <td className="py-2 pr-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="hover:underline"
                          >
                            {order.customer.name}
                          </Link>
                        </td>
                        <td className="py-2 pr-2 text-zinc-600 dark:text-zinc-400">
                          {new Date(order.createdAt).toLocaleString("ko-KR")}
                        </td>
                        <td className="py-2 pr-2 text-zinc-600 dark:text-zinc-400">
                          {ORDER_STATUS_LABELS[order.status]}
                        </td>
                        <td className="py-2 text-right">{formatPrice(order.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-black/[.08] p-4 dark:border-white/[.145]">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                전체 {totalCount}건 · {page} / {totalPages}페이지
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isPending}
                  onClick={() => loadPage(page - 1)}
                  aria-label="이전 페이지"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[.08] disabled:opacity-40 dark:border-white/[.145]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || isPending}
                  onClick={() => loadPage(page + 1)}
                  aria-label="다음 페이지"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[.08] disabled:opacity-40 dark:border-white/[.145]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
