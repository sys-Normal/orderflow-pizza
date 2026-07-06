"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

export type LoginState = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  if (user.role !== "seller" && user.role !== "platform_admin") {
    return { error: "관리자 권한이 없는 계정입니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    createSessionValue({ userId: user.id, role: user.role }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    }
  );

  redirect(user.role === "platform_admin" ? "/admin/stores" : "/admin/orders");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
