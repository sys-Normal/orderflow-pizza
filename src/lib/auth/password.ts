import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

const TEMP_PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

// One-time credential generated when a platform admin creates a seller
// account on their behalf (see createStoreAction) — excludes visually
// ambiguous characters (0/O, 1/l/I) since it's read off-screen and typed
// in by hand when the branch owner logs in for the first time.
export function generateTempPassword(length = 12): string {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += TEMP_PASSWORD_CHARS[randomInt(TEMP_PASSWORD_CHARS.length)];
  }
  return password;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return (
    derivedKey.length === hashBuffer.length && timingSafeEqual(derivedKey, hashBuffer)
  );
}
