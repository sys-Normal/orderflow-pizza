import { BuyerLoginForm } from "@/components/buyer-login-form";
import { SeedAccountHint } from "@/components/seed-account-hint";

const ERROR_MESSAGES: Record<string, string> = {
  google: "구글 로그인에 실패했습니다. 다시 시도해주세요.",
  "email-in-use": "이미 다른 방식으로 가입된 이메일입니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/checkout", error } = await searchParams;

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <SeedAccountHint roles={["buyer"]} />
      </div>
      {error && ERROR_MESSAGES[error] && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {ERROR_MESSAGES[error]}
        </p>
      )}
      <BuyerLoginForm next={next} />
    </div>
  );
}
