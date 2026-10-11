import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, rateLimits } from "@/db/schema";
import { services } from "@/lib/cefabex";
import { json, sameOrigin } from "@/lib/server";

const input=z.object({id:z.string().uuid(),name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),phone:z.string().trim().max(25).regex(/^[+\d\s().-]*$/,"Use a valid phone number").default(""),company:z.string().trim().max(150).default(""),service:z.string().refine(v=>[...services.map(s=>s.name),"Other / Collaboration"].includes(v),"Choose a service"),message:z.string().trim().min(20,"Tell us a little more (at least 20 characters)").max(5000),consent:z.literal(true,{errorMap:()=>({message:"Consent is required to submit your inquiry"})}),website:z.string().max(0).optional()});
export async function POST(request:Request){
 try{
  if(!sameOrigin(request))return json({error:"Invalid request origin"},403);
  if(Number(request.headers.get("content-length")||0)>20000)return json({error:"Inquiry is too large"},413);
  const parsed=input.safeParse(await request.json());
  if(!parsed.success){const errors=Object.fromEntries(parsed.error.issues.map(i=>[i.path[0],i.message]));return json({error:"Please check the highlighted fields.",errors},400);}
  const data=parsed.data;const db=getDb();
  const existing=await db.select({id:inquiries.id}).from(inquiries).where(eq(inquiries.id,data.id));
  if(existing.length)return json({reference:`CFB-${data.id.slice(0,8).toUpperCase()}`},200);
  const ip=request.headers.get("cf-connecting-ip");
  if(ip){const bucket=Math.floor(Date.now()/900000);const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+":"+bucket));const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
   await db.insert(rateLimits).values({id:key,count:1,expiresAt:(bucket+1)*900000}).onConflictDoUpdate({target:rateLimits.id,set:{count:sql`${rateLimits.count}+1`}});
   const [limit]=await db.select().from(rateLimits).where(eq(rateLimits.id,key));if(limit.count>6)return json({error:"Too many inquiries. Please try again in 15 minutes or contact us on WhatsApp."},429);
   await db.run(sql`DELETE FROM rate_limits WHERE expires_at < ${Date.now()}`);
  }
  await db.insert(inquiries).values({id:data.id,name:data.name,email:data.email,phone:data.phone,company:data.company,service:data.service,message:data.message,createdAt:new Date().toISOString()}).onConflictDoNothing();
  return json({reference:`CFB-${data.id.slice(0,8).toUpperCase()}`},201);
 }catch{return json({error:"Could not save your inquiry. Please try again or contact us on WhatsApp."},500);}
}
