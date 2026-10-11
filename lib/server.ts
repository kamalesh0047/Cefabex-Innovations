import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
const COOKIE = "cefabex_admin";
const MAX_AGE = 60 * 60 * 12;
export function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // With an Origin header, compare against the actual request host as sent by the client.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return !origin || (host !== null && new URL(origin).host === host && new URL(origin).protocol === (process.env.NODE_ENV === "production" ? "https:" : new URL(request.url).protocol));
}
function signature(payload: string, secret: string) { return createHmac("sha256", secret).update(payload).digest("hex"); }
export function makeSession(secret: string) {
  const payload = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return `${payload}.${signature(payload, secret)}`;
}
export async function adminAccess() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return { user: null, allowed: false, activated: false };
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie) return { user: null, allowed: false, activated: true };
  const [expiry, mac, extra] = cookie.split(".");
  if (extra !== undefined || !expiry || !mac || !/^\d+$/.test(expiry) || Number(expiry) < Date.now() / 1000) return { user: null, allowed: false, activated: true };
  const expected = Buffer.from(signature(expiry, secret), "hex");
  const supplied = /^[a-f0-9]{64}$/.test(mac) ? Buffer.from(mac, "hex") : Buffer.alloc(0);
  const valid = expected.length === supplied.length && timingSafeEqual(expected, supplied);
  return { user: valid ? { userId: "site-owner" } : null, allowed: valid, activated: true };
}
export function safeImage(value: string) { return value === "" || /^\/media\/[a-zA-Z0-9_.-]+\.webp$/.test(value) || /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\/[^\s]+$/i.test(value); }
export const adminCookieName = COOKIE;
export const adminSessionAge = MAX_AGE;
