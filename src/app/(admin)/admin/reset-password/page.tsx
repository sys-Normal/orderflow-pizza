import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getValidResetToken } from "@/lib/auth/reset-token";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // Check the token is actually valid (exists, unused, unexpired) up front
  // rather than only at submit time — otherwise any junk token value shows
  // the full "set a new password" form and only fails after the user has
  // already typed one in.
  const resetToken = token ? await getValidResetToken(token) : null;

  if (!token || !resetToken) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">잘못된 링크입니다</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.
        </p>
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
