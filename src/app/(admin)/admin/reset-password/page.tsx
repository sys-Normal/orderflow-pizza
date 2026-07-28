import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">잘못된 링크입니다</h1>
        <Link
          href="/admin/forgot-password"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          다시 요청하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">새 비밀번호 설정</h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}
