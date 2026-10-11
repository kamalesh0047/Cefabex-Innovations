import { and, eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { events, reviews } from "@/db/schema";
import { json } from "@/lib/server";
export async function GET(request:Request){try{const kind=new URL(request.url).searchParams.get("kind");const db=getDb();if(kind==="events")return json({records:await db.select().from(events).where(and(eq(events.published,true),eq(events.archived,false))).orderBy(desc(events.date))});if(kind==="reviews")return json({records:await db.select().from(reviews).where(and(eq(reviews.published,true),eq(reviews.archived,false),eq(reviews.consentConfirmed,true))).orderBy(desc(reviews.createdAt))});return json({error:"Unknown content type"},400);}catch{return json({error:"Content could not be loaded"},503);}}
