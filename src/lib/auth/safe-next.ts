export const DEFAULT_NEXT = "/checkout";

// Only accept an in-app relative path — anything else (absolute URL,
// protocol-relative `//host`) falls back to the default instead of becoming
// an open redirect. Shared by the buyer login/signup actions and the Google
// OAuth routes, all of which take `next` from user-controlled input.
export function safeNext(next: string | null | undefined): string {
  const value = next ?? "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return DEFAULT_NEXT;
}
