import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { getSessionUser } from "@/lib/auth/current-user";

export default async function ForgotPasswordPage() {
  const session = await getSessionUser();
  if (session?.role === "seller" || session?.role === "platform_admin") {
    redirect(session.role === "platform_admin" ? "/admin/stores" : "/admin/orders");
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">비밀번호 재설정</h1>
      <ForgotPasswordForm />
    </div>
  );
}
