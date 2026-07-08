import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type SessionRole = "seller" | "platform_admin" | "buyer";
export type SessionPayload = { userId: string; role: SessionRole };

const VALID_ROLES: SessionRole[] = ["seller", "platform_admin", "buyer"];

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되어 있지 않습니다.");
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("hex");
}

// Signed cookie value (userId.role.expiry.signature) instead of a real
// session store — enough to stop tampering/impersonation for a portfolio
// project without adding a sessions table or a JWT dependency.
export function createSessionValue(payload: SessionPayload): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const data = `${payload.userId}.${payload.role}.${expiresAt}`;
  return `${data}.${sign(data)}`;
}

export function verifySessionValue(value: string): SessionPayload | null {
  const segments = value.split(".");
  if (segments.length !== 4) return null;
  const [userId, role, expiresAt, signature] = segments;
  const data = `${userId}.${role}.${expiresAt}`;

  const expected = Buffer.from(sign(data), "hex");
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  if (Date.now() > Number(expiresAt)) return null;
  if (!VALID_ROLES.includes(role as SessionRole)) return null;

  return { userId, role: role as SessionRole };
}
