import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
  if (database) return database;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error("Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
  const client = createClient({ url, authToken });
  database = drizzle(client, { schema });
  return database;
}
