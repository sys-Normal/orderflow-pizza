"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/safe-next";

async function setBuyerSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue({ userId, role: "buyer" }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export type BuyerAuthState = { error: string } | undefined;

export async function buyerLoginAction(
  _prevState: BuyerAuthState,
  formData: FormData
): Promise<BuyerAuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  if (user.role !== "buyer") {
    return { error: "구매자 계정이 아닙니다." };
  }

  await setBuyerSession(user.id);
  redirect(next);
}

export async function buyerSignupAction(
  _prevState: BuyerAuthState,
  formData: FormData
): Promise<BuyerAuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== confirmPassword) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "이미 사용 중인 이메일입니다." };
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: hashPassword(password), role: "buyer" },
  });

  await setBuyerSession(user.id);
  redirect(next);
}

export async function buyerLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  // Same target as the header logo — "/" is the one place every flow
  // (buyer/seller/admin) can always get back to.
  redirect("/");
}
