import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/auth/password";

// Shared by both the reset-password page (early "this link is dead" check
// before the user bothers filling out the form) and resetPasswordAction
// (the actual authoritative check at submit time) — kept in one place so
// the two can't drift apart on what counts as valid.
export async function getValidResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return null;
  }
  return resetToken;
}
