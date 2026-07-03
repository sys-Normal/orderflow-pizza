import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionValue, type SessionPayload } from "@/lib/auth/session";

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return verifySessionValue(value);
}
