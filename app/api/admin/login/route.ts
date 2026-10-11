import { timingSafeEqual } from "node:crypto";
import { adminCookieName, adminSessionAge, json, makeSession, sameOrigin } from "@/lib/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
  const configured = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!configured || configured.length < 12 || !secret || secret.length < 32) return json({ error: "Admin environment variables have not been configured" }, 503);
  if (Number(request.headers.get("content-length") || 0) > 4096) return json({ error: "Invalid request" }, 413);
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || body.password.length > 256) return json({ error: "Invalid credentials" }, 401);
  const a = Buffer.from(body.password); const b = Buffer.from(configured);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json({ error: "Invalid credentials" }, 401);
  const response = json({ ok: true });
  response.headers.append("Set-Cookie", `${adminCookieName}=${makeSession(secret)}; Path=/; HttpOnly; SameSite=Strict; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}Max-Age=${adminSessionAge}`);
  return response;
}
