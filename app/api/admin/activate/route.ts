import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { adminAccess, json, privateBootstrapEnabled, sameOrigin } from "@/lib/server";
export async function POST(request:Request){try{if(!sameOrigin(request))return json({error:"Invalid request origin"},403);const access=await adminAccess();if(!access.user)return json({error:"Sign in to access administration"},401);if(access.activated)return access.allowed?json({ok:true}):json({error:"This account does not have admin access"},403);if(!privateBootstrapEnabled())return json({error:"Admin activation is disabled. Contact the site owner."},403);
 await getDb().insert(admins).values({id:1,userId:access.user.userId,createdAt:new Date().toISOString()}).onConflictDoNothing();
 const [owner]=await getDb().select().from(admins).where(eq(admins.id,1));return owner.userId===access.user.userId?json({ok:true}):json({error:"This account does not have admin access"},403);
}catch{return json({error:"Could not activate admin. Please try again."},500);}}
