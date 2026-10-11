import { adminCookieName, json, sameOrigin } from "@/lib/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);
  const response = json({ ok: true });
  response.headers.append("Set-Cookie", `${adminCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
  return response;
}
