import { LoginForm } from "@/components/login-form";
import { SeedAccountHint } from "@/components/seed-account-hint";

export default function AdminLoginPage() {
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
