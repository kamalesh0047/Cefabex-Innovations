import { json } from "@/lib/server";
export const runtime = "nodejs";
export async function POST() { return json({ error: "Activation is no longer required. Log in with the configured admin password." }, 410); }
