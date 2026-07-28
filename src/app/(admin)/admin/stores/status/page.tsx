import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { getStoreByOwnerId } from "@/lib/stores/queries";
import { StoreStatusBadge } from "@/components/store-status-badge";

const STATUS_MESSAGE: Record<"pending" | "suspended" | "rejected", string> = {
  pending: "매장이 아직 승인 대기 상태입니다. 플랫폼 관리자에게 문의해주세요.",
  suspended: "매장이 정지된 상태입니다. 문의사항은 플랫폼 관리자에게 연락해주세요.",
  rejected: "매장 이용이 거절된 상태입니다. 문의사항은 플랫폼 관리자에게 연락해주세요.",
};

export default async function StoreStatusPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  if (session.role !== "seller") redirect("/admin/stores");

  const store = await getStoreByOwnerId(session.userId);

  if (store?.status === "approved") {
    redirect("/admin/orders");
  }

  if (!store) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">매장 정보 없음</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          이 계정에 연결된 매장이 없습니다. 플랫폼 관리자에게 문의해주세요.
        </p>
      </div>
    );
  }

  const status = store.status as "pending" | "suspended" | "rejected";
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
        <StoreStatusBadge status={store.status} />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{STATUS_MESSAGE[status]}</p>
    </div>
  );
}
