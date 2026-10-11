import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store"}});}
export async function adminAccess(){
 const user=await getChatGPTUser();if(!user)return {user:null,allowed:false,activated:false};
 const rows=await getDb().select().from(admins).where(eq(admins.id,1));
 return {user,allowed:rows[0]?.userId===user.userId,activated:!!rows[0]};
}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin;}
export function privateBootstrapEnabled(){return env.SITE_PRIVATE_ADMIN_BOOTSTRAP==="true";}
export function safeImage(value:string){return value===""||/^\/media\/[a-zA-Z0-9_.-]+\.webp$/.test(value)||/^\/api\/media\/[a-zA-Z0-9-]+$/.test(value);}
