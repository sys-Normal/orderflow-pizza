import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { SeedAccountHint } from "@/components/seed-account-hint";
import { getSessionUser } from "@/lib/auth/current-user";

export default async function AdminLoginPage() {
  const session = await getSessionUser();
  if (session?.role === "seller" || session?.role === "platform_admin") {
    redirect(session.role === "platform_admin" ? "/admin/stores" : "/admin/orders");
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">관리자 로그인</h1>
        <SeedAccountHint />
      </div>
      <LoginForm />
    </div>
  );
}
