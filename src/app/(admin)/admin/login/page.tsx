import { LoginForm } from "@/components/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col items-start gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">관리자 로그인</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          포트폴리오용 mock 계정: admin / admin1234
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
