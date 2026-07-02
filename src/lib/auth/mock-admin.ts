// Portfolio-only mock credentials. There is no real backend/user store here —
// a production deployment would validate against a real identity provider
// instead of a hardcoded pair.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin1234";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_VALUE = "authenticated";

export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
