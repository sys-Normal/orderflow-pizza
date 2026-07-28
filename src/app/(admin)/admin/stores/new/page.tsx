import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/current-user";
import { StoreCreateForm } from "@/components/store-create-form";

export default async function NewStorePage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin/login");
  if (session.role !== "platform_admin") redirect("/admin/orders");

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/stores"
        className="inline-flex items-center gap-1 self-start text-sm text-zinc-600 hover:text-primary dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        매장 목록
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">새 지점 생성</h1>
      <StoreCreateForm />
    </div>
  );
}
