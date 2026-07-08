import { BuyerSignupForm } from "@/components/buyer-signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/checkout" } = await searchParams;

  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
      <BuyerSignupForm next={next} />
    </div>
  );
}
