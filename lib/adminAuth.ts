import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.ADMIN_SESSION_SECRET || "jobfinder-dev-secret-change-me";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const ADMIN_COOKIE = "jobfinder_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function checkAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createSessionToken(): string {
  const payload = `admin:${Date.now() + MAX_AGE_SECONDS * 1000}`;
  const sig = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [encodedPayload, sig] = token.split(".");
  if (!encodedPayload || !sig) return false;
  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const expectedSig = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
  const [, expiryStr] = payload.split(":");
  const expiry = Number(expiryStr);
  return Number.isFinite(expiry) && Date.now() < expiry;
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export { MAX_AGE_SECONDS };
