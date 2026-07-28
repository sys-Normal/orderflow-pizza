"use server";

import { prisma } from "@/lib/db";
import { generateResetToken, hashPassword, hashResetToken } from "@/lib/auth/password";
import { getValidResetToken } from "@/lib/auth/reset-token";
import { sendEmail } from "@/lib/email/resend";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1시간

// Always the same regardless of whether the email matched an account —
// otherwise this endpoint could be used to check which emails have accounts.
const GENERIC_MESSAGE =
  "입력하신 이메일로 계정이 확인되면 재설정 안내를 보내드립니다.";

export type RequestResetState = { message: string } | undefined;

export async function requestPasswordResetAction(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { message: GENERIC_MESSAGE };

  const user = await prisma.user.findUnique({ where: { email } });
  // Scoped to admin/seller login (/admin/login) — buyers have their own
  // separate auth flow and aren't covered by this reset path.
  if (user && (user.role === "seller" || user.role === "platform_admin")) {
    const token = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${process.env.APP_URL}/admin/reset-password?token=${token}`;
    try {
      await sendEmail(
        user.email,
        "OrderFlow Pizza 비밀번호 재설정",
        `<p>아래 링크를 눌러 비밀번호를 재설정해주세요. 이 링크는 1시간 동안만 유효합니다.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.</p>`
      );
    } catch (error) {
      // Don't let a provider-side failure (e.g. Resend sandbox mode
      // rejecting an unverified recipient) surface to the user or change
      // the generic response below — that would leak whether the email
      // matched an account, and there's nothing the user can do about it
      // anyway.
      console.error("Failed to send password reset email:", error);
    }
  }

  return { message: GENERIC_MESSAGE };
}

// `nonce` differs on every submission (even a re-submitted, textually
// identical error) so the client can key off it to replay a "this just
// happened" animation — see ResetPasswordForm.
export type ResetPasswordState =
  | { error: string; nonce: number }
  | { success: true }
  | undefined;

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다.", nonce: Date.now() };
  }
  if (password !== confirmPassword) {
    return { error: "비밀번호가 일치하지 않습니다.", nonce: Date.now() };
  }

  const resetToken = await getValidResetToken(token);
  if (!resetToken) {
    return {
      error: "유효하지 않거나 만료된 링크입니다. 다시 요청해주세요.",
      nonce: Date.now(),
    };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashPassword(password) },
    }),
    // Invalidate every outstanding token for this user, not just the one
    // used here, so an older unused reset link can't be replayed later.
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null },
      data: { usedAt: now },
    }),
  ]);

  return { success: true };
}
